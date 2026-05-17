import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import {
  calculateAverageCost,
  convertToBaseUnit,
  createInventoryTransaction,
} from "../lib/inventoryEngine.js";

const Decimal = Prisma.Decimal;

function toDecimal(value) {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") return new Decimal(value);
  throw new ApiError(400, "INVALID_INPUT", "Invalid numeric value");
}

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function listPurchases({ hotelId, branchId, query }) {
  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.status ? { status: query.status } : {}),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  return prisma.purchase.findMany({
    where,
    include: {
      supplier: true,
      items: {
        include: {
          inventoryItem: { include: { baseUnit: true } },
          unit: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getPurchaseById({ hotelId, branchId, id }) {
  const purchase = await prisma.purchase.findFirst({
    where: { id, ...withBranchScope({ hotelId, branchId }) },
    include: {
      supplier: true,
      items: {
        include: {
          inventoryItem: { include: { baseUnit: true } },
          unit: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });

  if (!purchase) throw new ApiError(404, "NOT_FOUND", "Purchase not found");
  return purchase;
}

export async function createPurchase({ hotelId, branchId, userId, input }) {
  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findFirst({
      where: {
        id: input.supplierId,
        ...withBranchScope({ hotelId, branchId }),
      },
    });

    if (!supplier)
      throw new ApiError(400, "INVALID_SUPPLIER", "Supplier not found");

    const inventoryItemIds = input.items.map((i) => i.inventoryItemId);
    const unitIds = input.items.map((i) => i.unitId);

    const items = await tx.inventoryItem.findMany({
      where: {
        id: { in: inventoryItemIds },
        ...withBranchScope({ hotelId, branchId }),
      },
      include: { baseUnit: true },
    });

    if (items.length !== inventoryItemIds.length) {
      throw new ApiError(
        400,
        "INVALID_ITEM",
        "One or more inventory items not found",
      );
    }

    const units = await tx.measurementUnit.findMany({
      where: { id: { in: unitIds } },
    });

    if (units.length !== unitIds.length) {
      throw new ApiError(400, "INVALID_UNIT", "One or more units not found");
    }

    const itemById = new Map(items.map((i) => [i.id, i]));
    const unitById = new Map(units.map((u) => [u.id, u]));

    const taxCents = toDecimal(input.taxCents ?? 0);
    if (taxCents.lt(0))
      throw new ApiError(400, "INVALID_TAX", "taxCents cannot be negative");

    const computedItems = input.items.map((line) => {
      const inventoryItem = itemById.get(line.inventoryItemId);
      const unit = unitById.get(line.unitId);

      const qty = toDecimal(line.quantity);
      if (qty.lte(0))
        throw new ApiError(400, "INVALID_QUANTITY", "Quantity must be > 0");

      const unitCostCents = toDecimal(line.unitCostCents);
      if (unitCostCents.lt(0))
        throw new ApiError(
          400,
          "INVALID_COST",
          "unitCostCents cannot be negative",
        );

      const qtyInBase = convertToBaseUnit({
        quantity: qty,
        unit,
        baseUnit: inventoryItem.baseUnit,
      });

      const totalCostCents = unitCostCents.mul(qty);

      return {
        inventoryItemId: inventoryItem.id,
        unitId: unit.id,
        quantity: qty,
        quantityInBaseUnit: qtyInBase,
        unitCostCents,
        totalCostCents,
      };
    });

    const subtotalCents = computedItems.reduce(
      (acc, i) => acc.add(i.totalCostCents),
      new Decimal(0),
    );

    const totalCents = subtotalCents.add(taxCents);

    const purchase = await tx.purchase.create({
      data: {
        hotelId,
        branchId: branchId ?? null,
        supplierId: supplier.id,
        status: "DRAFT",
        orderedAt: input.orderedAt ? new Date(input.orderedAt) : null,
        expectedAt: input.expectedAt ? new Date(input.expectedAt) : null,
        notes: input.notes ?? null,
        createdByUserId: userId ?? null,
        subtotalCents,
        taxCents,
        totalCents,
        items: {
          create: computedItems,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            inventoryItem: { include: { baseUnit: true } },
            unit: true,
          },
        },
      },
    });

    return purchase;
  });
}

export async function updatePurchase({ hotelId, branchId, userId, id, input }) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findFirst({
      where: { id, ...withBranchScope({ hotelId, branchId }) },
      include: {
        items: {
          include: {
            inventoryItem: { include: { baseUnit: true } },
            unit: true,
          },
        },
      },
    });

    if (!purchase) throw new ApiError(404, "NOT_FOUND", "Purchase not found");

    // Receiving is a state transition that also writes inventory + transactions.
    const nextStatus = input.status;

    if (nextStatus === "RECEIVED") {
      if (purchase.status === "RECEIVED") {
        throw new ApiError(
          400,
          "INVALID_STATUS",
          "Purchase is already received",
        );
      }
      if (purchase.status === "CANCELLED") {
        throw new ApiError(
          400,
          "INVALID_STATUS",
          "Cancelled purchase cannot be received",
        );
      }

      for (const line of purchase.items) {
        const item = line.inventoryItem;
        const baseUnit = item.baseUnit;
        const unit = line.unit;

        const qtyInBase = toDecimal(line.quantityInBaseUnit);

        const unitCostPerBaseUnitCents = toDecimal(line.unitCostCents)
          .div(toDecimal(unit.conversionFactor))
          .mul(toDecimal(baseUnit.conversionFactor));

        const currentQty = toDecimal(item.quantityInStock);
        const nextAvg = calculateAverageCost({
          currentQtyInBaseUnit: currentQty,
          currentAvgCostPerBaseUnitCents: item.averageCostPerBaseUnitCents,
          receivedQtyInBaseUnit: qtyInBase,
          receivedUnitCostPerBaseUnitCents: unitCostPerBaseUnitCents,
        });

        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            quantityInStock: { increment: qtyInBase },
            averageCostPerBaseUnitCents: nextAvg,
          },
        });

        await createInventoryTransaction({
          tx,
          data: {
            hotelId,
            branchId: branchId ?? null,
            inventoryItemId: item.id,
            type: "PURCHASE",
            quantity: toDecimal(line.quantity),
            unitId: line.unitId,
            quantityInBaseUnit: qtyInBase,
            unitCostPerBaseUnitCents,
            totalCostCents: toDecimal(line.totalCostCents),
            referenceType: "PURCHASE",
            referenceId: purchase.id,
            note: null,
            createdByUserId: userId ?? null,
          },
        });
      }

      const receivedAt = input.receivedAt
        ? new Date(input.receivedAt)
        : new Date();

      return tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "RECEIVED",
          receivedAt,
        },
        include: {
          supplier: true,
          items: {
            include: {
              inventoryItem: { include: { baseUnit: true } },
              unit: true,
            },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      });
    }

    if (nextStatus === "CANCELLED" && purchase.status === "RECEIVED") {
      throw new ApiError(
        400,
        "INVALID_STATUS",
        "Received purchase cannot be cancelled",
      );
    }

    const taxCents =
      input.taxCents === undefined ? null : toDecimal(input.taxCents);
    if (taxCents != null && taxCents.lt(0)) {
      throw new ApiError(400, "INVALID_TAX", "taxCents cannot be negative");
    }

    // Update purchase header fields (no item edits in this stage).
    return tx.purchase.update({
      where: { id: purchase.id },
      data: {
        status: nextStatus ?? undefined,
        orderedAt:
          input.orderedAt === undefined
            ? undefined
            : input.orderedAt
              ? new Date(input.orderedAt)
              : null,
        expectedAt:
          input.expectedAt === undefined
            ? undefined
            : input.expectedAt
              ? new Date(input.expectedAt)
              : null,
        receivedAt:
          input.receivedAt === undefined
            ? undefined
            : input.receivedAt
              ? new Date(input.receivedAt)
              : null,
        notes: input.notes === undefined ? undefined : input.notes,
        ...(taxCents != null
          ? {
              taxCents,
              totalCents: toDecimal(purchase.subtotalCents).add(taxCents),
            }
          : {}),
      },
      include: {
        supplier: true,
        items: {
          include: {
            inventoryItem: { include: { baseUnit: true } },
            unit: true,
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  });
}
