import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import {
  adjustInventoryStock,
  createInventoryTransaction,
  validateInventoryAvailability,
} from "../lib/inventoryEngine.js";
import {
  assertRecipeIsActive,
  assertServingsPositive,
  getRecipeOrThrow,
} from "./recipeValidation.service.js";

export async function consumeRecipeIngredients({
  hotelId,
  branchId,
  userId,
  recipeId,
  servings,
  sourceType,
  sourceId,
}) {
  const servingsDec = assertServingsPositive(servings);

  return prisma.$transaction(async (tx) => {
    const recipe = await getRecipeOrThrow({
      hotelId,
      branchId,
      id: recipeId,
      tx,
    });
    assertRecipeIsActive(recipe);

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      throw new ApiError(
        400,
        "RECIPE_EMPTY",
        "Recipe has no ingredients; nothing to consume",
      );
    }

    const consumptionRows = [];
    const inventoryTransactions = [];

    for (const ing of recipe.ingredients) {
      const item = ing.inventoryItem;
      if (!item) {
        throw new ApiError(
          400,
          "INVALID_RECIPE",
          "Recipe ingredient inventory item not found",
        );
      }

      const requiredBase = toDecimal(ing.quantityInBaseUnit).mul(servingsDec);
      if (requiredBase.lte(0)) continue;

      validateInventoryAvailability({
        quantityInStock: item.quantityInStock,
        requiredQtyInBaseUnit: requiredBase,
      });

      const unitCostCents = toDecimal(item.averageCostPerBaseUnitCents ?? 0);
      const totalCostCents = requiredBase.mul(unitCostCents);

      const consumption = await tx.inventoryConsumption.create({
        data: {
          hotelId,
          branchId: branchId ?? null,
          recipeId: recipe.id,
          recipeIngredientId: ing.id,
          inventoryItemId: item.id,
          sourceType,
          sourceId: sourceId ?? null,
          // Stored in base units for unambiguous reporting.
          quantityConsumed: requiredBase,
          quantityConsumedBaseUnit: requiredBase,
          unitCostCents,
          totalCostCents,
        },
      });

      // Decrease inventory stock by requiredBase.
      await adjustInventoryStock({
        tx,
        inventoryItemId: item.id,
        deltaQtyInBaseUnit: requiredBase.mul(new Decimal(-1)),
      });

      const txn = await createInventoryTransaction({
        tx,
        data: {
          hotelId,
          branchId: branchId ?? null,
          inventoryItemId: item.id,
          type: "CONSUMPTION",
          quantity: requiredBase,
          unitId: item.baseUnitId,
          quantityInBaseUnit: requiredBase,
          unitCostPerBaseUnitCents: unitCostCents,
          totalCostCents,
          referenceType: "RECIPE_CONSUMPTION",
          referenceId: consumption.id,
          note: `Recipe consumption: ${recipe.name}`,
          createdByUserId: userId ?? null,
        },
      });

      consumptionRows.push(consumption);
      inventoryTransactions.push(txn);
    }

    return {
      recipeId: recipe.id,
      servings: servingsDec,
      consumptions: consumptionRows,
      inventoryTransactions,
    };
  });
}

export async function listInventoryConsumptions({ hotelId, branchId, query }) {
  const where = {
    hotelId,
    ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    ...(query?.inventoryItemId
      ? { inventoryItemId: query.inventoryItemId }
      : {}),
    ...(query?.recipeId ? { recipeId: query.recipeId } : {}),
    ...(query?.sourceType ? { sourceType: query.sourceType } : {}),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  return prisma.inventoryConsumption.findMany({
    where,
    include: {
      recipe: { select: { id: true, name: true } },
      recipeIngredient: { select: { id: true } },
      inventoryItem: { select: { id: true, name: true, baseUnit: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

function formatDay(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function inventoryConsumptionReport({ hotelId, branchId, query }) {
  const where = {
    hotelId,
    ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    ...(query?.inventoryItemId
      ? { inventoryItemId: query.inventoryItemId }
      : {}),
    ...(query?.recipeId ? { recipeId: query.recipeId } : {}),
    ...(query?.includeWaste ? {} : { sourceType: { not: "MANUAL_WASTE" } }),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const rows = await prisma.inventoryConsumption.findMany({
    where,
    include: {
      inventoryItem: {
        select: { id: true, name: true, quantityInStock: true, baseUnit: true },
      },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const daily = new Map();
  const byItem = new Map();

  let totalCostCents = new Decimal(0);
  let totalQuantityBaseUnit = new Decimal(0);

  for (const r of rows) {
    const day = formatDay(new Date(r.createdAt));
    const qty = toDecimal(r.quantityConsumedBaseUnit);
    const cost = toDecimal(r.totalCostCents);

    totalCostCents = totalCostCents.add(cost);
    totalQuantityBaseUnit = totalQuantityBaseUnit.add(qty);

    const prevDay = daily.get(day) ?? {
      day,
      totalCostCents: new Decimal(0),
      totalQuantityBaseUnit: new Decimal(0),
      count: 0,
    };

    prevDay.totalCostCents = prevDay.totalCostCents.add(cost);
    prevDay.totalQuantityBaseUnit = prevDay.totalQuantityBaseUnit.add(qty);
    prevDay.count += 1;
    daily.set(day, prevDay);

    const itemKey = r.inventoryItemId;
    const prevItem = byItem.get(itemKey) ?? {
      inventoryItemId: r.inventoryItemId,
      name: r.inventoryItem?.name,
      baseUnitSymbol: r.inventoryItem?.baseUnit?.symbol,
      totalCostCents: new Decimal(0),
      totalQuantityBaseUnit: new Decimal(0),
      count: 0,
    };

    prevItem.totalCostCents = prevItem.totalCostCents.add(cost);
    prevItem.totalQuantityBaseUnit = prevItem.totalQuantityBaseUnit.add(qty);
    prevItem.count += 1;
    byItem.set(itemKey, prevItem);
  }

  const topItems = Array.from(byItem.values()).sort((a, b) =>
    toDecimal(b.totalCostCents).cmp(toDecimal(a.totalCostCents)),
  );

  return {
    totalRows: rows.length,
    totalCostCents,
    totalQuantityBaseUnit,
    daily: Array.from(daily.values()),
    topItems,
  };
}

export async function usageVelocityReport({ hotelId, branchId, query }) {
  const lookbackDays = Number(query?.lookbackDays ?? 30);
  const days =
    Number.isFinite(lookbackDays) && lookbackDays > 0 ? lookbackDays : 30;

  const to = query?.to ? new Date(query.to) : new Date();
  const from = query?.from
    ? new Date(query.from)
    : new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const report = await inventoryConsumptionReport({
    hotelId,
    branchId,
    query: {
      ...query,
      from: from.toISOString(),
      to: to.toISOString(),
      includeWaste: false,
    },
  });

  // Join current stock levels.
  const ids = report.topItems.map((i) => i.inventoryItemId);
  const items = await prisma.inventoryItem.findMany({
    where: {
      id: { in: ids },
      hotelId,
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    },
    include: { baseUnit: true },
  });

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const denom = new Decimal(days);

  const velocity = report.topItems.map((agg) => {
    const item = itemMap.get(agg.inventoryItemId);
    const dailyUsage = denom.lte(0)
      ? new Decimal(0)
      : toDecimal(agg.totalQuantityBaseUnit).div(denom);

    const stock = item ? toDecimal(item.quantityInStock) : new Decimal(0);
    const daysRemaining = dailyUsage.gt(0) ? stock.div(dailyUsage) : null;

    return {
      inventoryItemId: agg.inventoryItemId,
      name: agg.name,
      baseUnitSymbol: item?.baseUnit?.symbol ?? agg.baseUnitSymbol,
      quantityInStock: item?.quantityInStock ?? null,
      avgDailyUsageBaseUnit: dailyUsage,
      estimatedDaysRemaining: daysRemaining,
      totalCostCentsLookback: agg.totalCostCents,
      totalQuantityBaseUnitLookback: agg.totalQuantityBaseUnit,
    };
  });

  return {
    from,
    to,
    lookbackDays: days,
    items: velocity,
  };
}
