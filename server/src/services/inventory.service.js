import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import {
  calculateAverageCost,
  convertToBaseUnit,
  createInventoryTransaction,
  validateInventoryAvailability,
} from "../lib/inventoryEngine.js";
import { notifyInventoryStockChange } from "./notificationTrigger.service.js";

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

export async function listInventoryItems({ hotelId, branchId, query }) {
  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.category ? { category: query.category } : {}),
    ...(query?.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { sku: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.inventoryItem.findMany({
    where,
    include: { baseUnit: true },
    orderBy: [{ name: "asc" }],
  });

  if (query?.lowStock === true) {
    return items.filter((i) => {
      const min = toDecimal(i.minimumStockLevel);
      const stock = toDecimal(i.quantityInStock);
      return min.gt(0) && stock.lte(min);
    });
  }

  return items;
}

export async function getInventoryItemById({ hotelId, branchId, id }) {
  const item = await prisma.inventoryItem.findFirst({
    where: {
      id,
      ...withBranchScope({ hotelId, branchId }),
    },
    include: { baseUnit: true },
  });

  if (!item) throw new ApiError(404, "NOT_FOUND", "Inventory item not found");
  return item;
}

export async function createInventoryItem({ hotelId, branchId, input }) {
  const baseUnit = await prisma.measurementUnit.findUnique({
    where: { id: input.baseUnitId },
  });

  if (!baseUnit) {
    throw new ApiError(400, "INVALID_BASE_UNIT", "Base unit not found");
  }

  if (!baseUnit.isBaseUnit) {
    throw new ApiError(
      400,
      "INVALID_BASE_UNIT",
      "baseUnitId must reference a base unit (conversionFactor=1)",
    );
  }

  const minimumStockLevel = toDecimal(input.minimumStockLevel ?? 0);

  if (minimumStockLevel.lt(0)) {
    throw new ApiError(
      400,
      "INVALID_MIN_STOCK_LEVEL",
      "minimumStockLevel cannot be negative",
    );
  }

  return prisma.inventoryItem.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      name: input.name,
      sku: input.sku ?? null,
      category: input.category ?? "OTHER",
      baseUnitId: baseUnit.id,
      minimumStockLevel,
    },
    include: { baseUnit: true },
  });
}

export async function updateInventoryItem({ hotelId, branchId, id, input }) {
  const item = await getInventoryItemById({ hotelId, branchId, id });

  let baseUnitId = input.baseUnitId;

  if (baseUnitId) {
    const baseUnit = await prisma.measurementUnit.findUnique({
      where: { id: baseUnitId },
    });

    if (!baseUnit) {
      throw new ApiError(400, "INVALID_BASE_UNIT", "Base unit not found");
    }

    if (!baseUnit.isBaseUnit) {
      throw new ApiError(
        400,
        "INVALID_BASE_UNIT",
        "baseUnitId must reference a base unit",
      );
    }

    baseUnitId = baseUnit.id;
  }

  const data = {
    name: input.name ?? undefined,
    sku: input.sku === undefined ? undefined : input.sku,
    category: input.category ?? undefined,
    baseUnitId: baseUnitId ?? undefined,
    minimumStockLevel:
      input.minimumStockLevel === undefined
        ? undefined
        : toDecimal(input.minimumStockLevel),
  };

  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data,
    include: { baseUnit: true },
  });

  // If thresholds were updated, re-evaluate low/out-of-stock.
  if (input.minimumStockLevel !== undefined) {
    await notifyInventoryStockChange({
      hotelId,
      branchId,
      inventoryItem: updated,
    });
  }

  return updated;
}

export async function deleteInventoryItem({ hotelId, branchId, id }) {
  const item = await getInventoryItemById({ hotelId, branchId, id });
  await prisma.inventoryItem.delete({ where: { id: item.id } });
}

export async function listInventoryTransactions({ hotelId, branchId, query }) {
  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.inventoryItemId
      ? { inventoryItemId: query.inventoryItemId }
      : {}),
    ...(query?.type ? { type: query.type } : {}),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  return prisma.inventoryTransaction.findMany({
    where,
    include: {
      inventoryItem: { select: { id: true, name: true, baseUnit: true } },
      unit: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createManualInventoryTransaction({
  hotelId,
  branchId,
  userId,
  input,
}) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findFirst({
      where: {
        id: input.inventoryItemId,
        ...withBranchScope({ hotelId, branchId }),
      },
      include: { baseUnit: true },
    });

    if (!item) throw new ApiError(404, "NOT_FOUND", "Inventory item not found");

    const unit = await tx.measurementUnit.findUnique({
      where: { id: input.unitId },
    });

    if (!unit) throw new ApiError(400, "INVALID_UNIT", "Unit not found");

    const qty = toDecimal(input.quantity);
    if (qty.eq(0)) {
      throw new ApiError(400, "INVALID_QUANTITY", "Quantity must be non-zero");
    }

    const qtyInBaseSigned = convertToBaseUnit({
      quantity: qty,
      unit,
      baseUnit: item.baseUnit,
    });

    const qtyInBaseAbs = qtyInBaseSigned.abs();
    const qtyInStock = toDecimal(item.quantityInStock);

    const isDecrease =
      input.type === "ADJUSTMENT" ? qtyInBaseSigned.lt(0) : true;

    const delta =
      input.type === "ADJUSTMENT" ? qtyInBaseSigned : qtyInBaseAbs.mul(-1);

    if (isDecrease) {
      validateInventoryAvailability({
        quantityInStock: qtyInStock,
        requiredQtyInBaseUnit: qtyInBaseAbs,
      });
    }

    let nextAvg = null;

    if (!isDecrease && input.unitCostCents != null) {
      const unitCostCents = toDecimal(input.unitCostCents);
      if (unitCostCents.lt(0)) {
        throw new ApiError(
          400,
          "INVALID_COST",
          "unitCostCents cannot be negative",
        );
      }

      const unitCostPerBaseUnitCents = unitCostCents
        .div(toDecimal(unit.conversionFactor))
        .mul(toDecimal(item.baseUnit.conversionFactor));

      nextAvg = calculateAverageCost({
        currentQtyInBaseUnit: qtyInStock,
        currentAvgCostPerBaseUnitCents: item.averageCostPerBaseUnitCents,
        receivedQtyInBaseUnit: qtyInBaseAbs,
        receivedUnitCostPerBaseUnitCents: unitCostPerBaseUnitCents,
      });
    }

    const updatedItem = await tx.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantityInStock: { increment: delta },
        ...(nextAvg != null ? { averageCostPerBaseUnitCents: nextAvg } : {}),
      },
      include: { baseUnit: true },
    });

    const unitCostPerBaseUnitCents =
      !isDecrease && input.unitCostCents != null
        ? toDecimal(input.unitCostCents)
            .div(toDecimal(unit.conversionFactor))
            .mul(toDecimal(item.baseUnit.conversionFactor))
        : null;

    const totalCostCents =
      !isDecrease && input.unitCostCents != null
        ? toDecimal(input.unitCostCents).mul(qty.abs())
        : null;

    const txn = await createInventoryTransaction({
      tx,
      data: {
        hotelId,
        branchId: branchId ?? null,
        inventoryItemId: item.id,
        type: input.type,
        quantity: qty,
        unitId: unit.id,
        quantityInBaseUnit: qtyInBaseSigned,
        unitCostPerBaseUnitCents,
        totalCostCents,
        note: input.note ?? null,
        createdByUserId: userId ?? null,
      },
    });

    await notifyInventoryStockChange({
      tx,
      hotelId,
      branchId,
      inventoryItem: updatedItem,
    });

    return { transaction: txn, inventoryItem: updatedItem };
  });
}
