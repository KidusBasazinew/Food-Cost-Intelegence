import { prisma } from "../../../prisma/client.js";
import { ApiError } from "../../../utils/apiError.js";
import { Decimal, toDecimal } from "../../../utils/decimal.js";
import {
  adjustInventoryStock,
  createInventoryTransaction,
  validateInventoryAvailability,
} from "../../../lib/inventoryEngine.js";
import { notifyInventoryStockChange } from "../../../services/notificationTrigger.service.js";

function asNonEmptyString(v) {
  if (typeof v !== "string" || v.trim().length === 0) return null;
  return v.trim();
}

function mulMoneyCents(unitPriceCents, quantity) {
  return toDecimal(unitPriceCents ?? 0).mul(toDecimal(quantity ?? 0));
}

function summarizeInsufficient({
  inventoryItemId,
  name,
  requiredBase,
  availableBase,
}) {
  return {
    inventoryItemId,
    name,
    requiredQtyInBaseUnit: requiredBase.toString(),
    availableQtyInBaseUnit: availableBase.toString(),
    shortageQtyInBaseUnit: requiredBase.sub(availableBase).toString(),
  };
}

export async function processPosOrderConsumption({
  tx,
  hotelId,
  branchId,
  userId,
  orderId,
  mode = "consume", // consume | recalculate | revert
}) {
  if (!hotelId) {
    throw new ApiError(400, "INVALID_CONTEXT", "Missing hotelId");
  }

  const run = async (innerTx) => {
    const order = await innerTx.posOrder.findFirst({
      where: {
        id: orderId,
        hotelId,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
      },
      include: {
        items: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: {
                    inventoryItem: { include: { baseUnit: true } },
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, "POS_ORDER_NOT_FOUND", "POS order not found");
    }

    if (!order.items || order.items.length === 0) {
      return {
        orderId: order.id,
        mode,
        applied: { consumptionsCreated: 0, stockMovementsCreated: 0 },
        totals: {
          ingredientCostCents: new Decimal(0),
          revenueCents: new Decimal(0),
        },
      };
    }

    // Compute target required base-unit consumption by recipeIngredient.
    const targetByIngredient = new Map();

    for (const it of order.items) {
      const qty = toDecimal(it.quantity);
      if (qty.lte(0)) continue;

      const recipe = it.recipe;
      if (!recipe?.ingredients || recipe.ingredients.length === 0) {
        throw new ApiError(
          400,
          "RECIPE_EMPTY",
          `Recipe has no ingredients; cannot consume (${recipe?.name || it.recipeId})`,
        );
      }

      for (const ing of recipe.ingredients) {
        const requiredBase = toDecimal(ing.quantityInBaseUnit).mul(qty);
        if (requiredBase.eq(0)) continue;

        const key = ing.id;
        const prev = targetByIngredient.get(key) ?? {
          recipeId: recipe.id,
          recipeName: recipe.name,
          recipeIngredientId: ing.id,
          inventoryItemId: ing.inventoryItemId,
          requiredQtyBaseUnit: new Decimal(0),
          // for richer errors
          inventoryItemName: ing.inventoryItem?.name,
          baseUnit: ing.inventoryItem?.baseUnit,
          baseUnitId: ing.inventoryItem?.baseUnitId,
        };

        prev.requiredQtyBaseUnit = prev.requiredQtyBaseUnit.add(requiredBase);
        targetByIngredient.set(key, prev);
      }
    }

    const existing = await innerTx.inventoryConsumption.findMany({
      where: {
        hotelId,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
        sourceType: "ORDER",
        posOrderId: order.id,
      },
      select: {
        id: true,
        recipeIngredientId: true,
        inventoryItemId: true,
        quantityConsumedBaseUnit: true,
        totalCostCents: true,
      },
    });

    const existingByIngredient = new Map();
    for (const row of existing) {
      const key = row.recipeIngredientId ?? row.inventoryItemId;
      const prev = existingByIngredient.get(key) ?? {
        qty: new Decimal(0),
        totalCostCents: new Decimal(0),
      };
      prev.qty = prev.qty.add(toDecimal(row.quantityConsumedBaseUnit));
      prev.totalCostCents = prev.totalCostCents.add(
        toDecimal(row.totalCostCents),
      );
      existingByIngredient.set(key, prev);
    }

    const deltas = [];

    if (mode === "revert") {
      // Revert everything consumed for this order.
      for (const [key, prev] of existingByIngredient.entries()) {
        if (prev.qty.eq(0)) continue;
        deltas.push({
          key,
          targetQty: new Decimal(0),
          existingQty: prev.qty,
          deltaQty: prev.qty.mul(new Decimal(-1)),
        });
      }
    } else {
      for (const [key, t] of targetByIngredient.entries()) {
        const ex = existingByIngredient.get(key);
        const existingQty = ex?.qty ?? new Decimal(0);
        const targetQty = toDecimal(t.requiredQtyBaseUnit);
        const deltaQty = targetQty.sub(existingQty);
        if (!deltaQty.eq(0)) {
          deltas.push({
            key,
            targetQty,
            existingQty,
            deltaQty,
          });
        }
      }

      // Also handle ingredients that were consumed previously but are no longer required (item removed / qty reduced).
      if (mode === "recalculate") {
        for (const [key, ex] of existingByIngredient.entries()) {
          if (targetByIngredient.has(key)) continue;
          const deltaQty = new Decimal(0).sub(toDecimal(ex.qty));
          if (!deltaQty.eq(0)) {
            deltas.push({
              key,
              targetQty: new Decimal(0),
              existingQty: toDecimal(ex.qty),
              deltaQty,
            });
          }
        }
      }
    }

    // Apply deltas.
    let consumptionsCreated = 0;
    let stockMovementsCreated = 0;

    const shortages = [];

    // A helper to locate metadata for a key.
    function resolveTargetMeta(key) {
      const meta = targetByIngredient.get(key);
      if (meta) return meta;

      // If we are reverting / recalc removed, fallback: try resolve via order recipes.
      for (const it of order.items) {
        const recipe = it.recipe;
        for (const ing of recipe?.ingredients ?? []) {
          if (ing.id === key) {
            return {
              recipeId: recipe.id,
              recipeName: recipe.name,
              recipeIngredientId: ing.id,
              inventoryItemId: ing.inventoryItemId,
              inventoryItemName: ing.inventoryItem?.name,
              baseUnit: ing.inventoryItem?.baseUnit,
              baseUnitId: ing.inventoryItem?.baseUnitId,
            };
          }
        }
      }

      // Last resort: treat key as inventoryItemId.
      return {
        recipeId: null,
        recipeName: null,
        recipeIngredientId: null,
        inventoryItemId: key,
        inventoryItemName: null,
        baseUnit: null,
        baseUnitId: null,
      };
    }

    for (const d of deltas) {
      const meta = resolveTargetMeta(d.key);
      const inventoryItemId = meta.inventoryItemId;

      if (!inventoryItemId) {
        throw new ApiError(
          400,
          "INVALID_RECIPE",
          "Missing inventoryItemId for consumption",
        );
      }

      const inventoryItem = await innerTx.inventoryItem.findFirst({
        where: {
          id: inventoryItemId,
          hotelId,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
        },
        include: { baseUnit: true },
      });

      if (!inventoryItem) {
        throw new ApiError(
          400,
          "INVENTORY_ITEM_NOT_FOUND",
          "Inventory item not found for POS consumption",
        );
      }

      const deltaQty = toDecimal(d.deltaQty);
      if (deltaQty.eq(0)) continue;

      const unitCostCents = toDecimal(
        inventoryItem.averageCostPerBaseUnitCents ?? 0,
      );
      const totalCostCents = deltaQty.mul(unitCostCents);

      const before = toDecimal(inventoryItem.quantityInStock ?? 0);

      if (deltaQty.gt(0)) {
        try {
          validateInventoryAvailability({
            quantityInStock: before,
            requiredQtyInBaseUnit: deltaQty,
          });
        } catch {
          shortages.push(
            summarizeInsufficient({
              inventoryItemId: inventoryItem.id,
              name: inventoryItem.name,
              requiredBase: deltaQty,
              availableBase: before,
            }),
          );
          continue;
        }

        // consume stock
        const consumption = await innerTx.inventoryConsumption.create({
          data: {
            hotelId,
            branchId: branchId ?? null,
            recipeId: meta.recipeId,
            recipeIngredientId: meta.recipeIngredientId,
            inventoryItemId: inventoryItem.id,
            posOrderId: order.id,
            sourceType: "ORDER",
            sourceId: order.id,
            quantityConsumed: deltaQty,
            quantityConsumedBaseUnit: deltaQty,
            unitCostCents,
            totalCostCents,
          },
        });
        consumptionsCreated += 1;

        const updated = await adjustInventoryStock({
          tx: innerTx,
          inventoryItemId: inventoryItem.id,
          deltaQtyInBaseUnit: deltaQty.mul(new Decimal(-1)),
        });

        await innerTx.stockMovement.create({
          data: {
            hotelId,
            branchId: branchId ?? null,
            inventoryItemId: inventoryItem.id,
            type: "SALE_CONSUMPTION",
            quantityBefore: before,
            quantityChanged: deltaQty.mul(new Decimal(-1)),
            quantityAfter: toDecimal(updated.quantityInStock ?? 0),
            unitCostCents,
            totalCostCents,
            referenceType: "POS_ORDER",
            referenceId: order.id,
            notes: asNonEmptyString(meta.recipeName)
              ? `POS sale consumption: ${meta.recipeName}`
              : "POS sale consumption",
          },
        });
        stockMovementsCreated += 1;

        await createInventoryTransaction({
          tx: innerTx,
          data: {
            hotelId,
            branchId: branchId ?? null,
            inventoryItemId: inventoryItem.id,
            type: "CONSUMPTION",
            quantity: deltaQty,
            unitId: inventoryItem.baseUnitId,
            quantityInBaseUnit: deltaQty,
            unitCostPerBaseUnitCents: unitCostCents,
            totalCostCents,
            referenceType: "POS_ORDER",
            referenceId: order.id,
            note: asNonEmptyString(meta.recipeName)
              ? `POS consumption: ${meta.recipeName}`
              : "POS consumption",
            createdByUserId: userId ?? null,
          },
        });

        await notifyInventoryStockChange({
          tx: innerTx,
          hotelId,
          branchId,
          inventoryItem: { ...updated, baseUnit: inventoryItem.baseUnit },
        });

        // Keep linter happy for unused consumption
        void consumption;
      } else {
        // revert / negative delta: add stock back and create reversal rows.
        const reversalQty = deltaQty; // negative
        const qtyToAdd = reversalQty.mul(new Decimal(-1));

        const reversal = await innerTx.inventoryConsumption.create({
          data: {
            hotelId,
            branchId: branchId ?? null,
            recipeId: meta.recipeId,
            recipeIngredientId: meta.recipeIngredientId,
            inventoryItemId: inventoryItem.id,
            posOrderId: order.id,
            sourceType: "ORDER",
            sourceId: order.id,
            quantityConsumed: reversalQty,
            quantityConsumedBaseUnit: reversalQty,
            unitCostCents,
            totalCostCents,
          },
        });
        consumptionsCreated += 1;

        const updated = await adjustInventoryStock({
          tx: innerTx,
          inventoryItemId: inventoryItem.id,
          deltaQtyInBaseUnit: qtyToAdd,
        });

        await innerTx.stockMovement.create({
          data: {
            hotelId,
            branchId: branchId ?? null,
            inventoryItemId: inventoryItem.id,
            type: "RETURN",
            quantityBefore: before,
            quantityChanged: qtyToAdd,
            quantityAfter: toDecimal(updated.quantityInStock ?? 0),
            unitCostCents,
            totalCostCents,
            referenceType: "POS_ORDER",
            referenceId: order.id,
            notes: asNonEmptyString(meta.recipeName)
              ? `POS reversal: ${meta.recipeName}`
              : "POS reversal",
          },
        });
        stockMovementsCreated += 1;

        await createInventoryTransaction({
          tx: innerTx,
          data: {
            hotelId,
            branchId: branchId ?? null,
            inventoryItemId: inventoryItem.id,
            type: "ADJUSTMENT",
            quantity: qtyToAdd,
            unitId: inventoryItem.baseUnitId,
            quantityInBaseUnit: qtyToAdd,
            unitCostPerBaseUnitCents: unitCostCents,
            totalCostCents,
            referenceType: "POS_ORDER_REVERSAL",
            referenceId: order.id,
            note: asNonEmptyString(meta.recipeName)
              ? `POS reversal adjustment: ${meta.recipeName}`
              : "POS reversal adjustment",
            createdByUserId: userId ?? null,
          },
        });

        void reversal;
      }
    }

    if (shortages.length > 0) {
      throw new ApiError(
        400,
        "INSUFFICIENT_STOCK",
        "Insufficient stock to process POS order consumption",
        { shortages },
      );
    }

    const [cogsAgg, revenueAgg] = await Promise.all([
      innerTx.inventoryConsumption.aggregate({
        where: {
          hotelId,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
          sourceType: "ORDER",
          posOrderId: order.id,
        },
        _sum: { totalCostCents: true },
      }),
      innerTx.posOrderItem.aggregate({
        where: { orderId: order.id },
        _sum: { totalPriceCents: true },
      }),
    ]);

    const ingredientCostCents = toDecimal(cogsAgg?._sum?.totalCostCents ?? 0);
    const revenueCents = toDecimal(revenueAgg?._sum?.totalPriceCents ?? 0);

    return {
      orderId: order.id,
      mode,
      applied: {
        consumptionsCreated,
        stockMovementsCreated,
      },
      totals: {
        ingredientCostCents,
        revenueCents,
        grossProfitCents: revenueCents.sub(ingredientCostCents),
        grossMarginPercent: revenueCents.lte(0)
          ? new Decimal(0)
          : revenueCents
              .sub(ingredientCostCents)
              .mul(new Decimal(100))
              .div(revenueCents),
      },
    };
  };

  // IMPORTANT: tx clients don't support nested $transaction.
  if (tx) return run(tx);
  return prisma.$transaction(run);
}
