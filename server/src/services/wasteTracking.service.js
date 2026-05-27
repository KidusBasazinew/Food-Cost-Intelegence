import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import {
  adjustInventoryStock,
  convertToBaseUnit,
  createInventoryTransaction,
  validateInventoryAvailability,
} from "../lib/inventoryEngine.js";
import {
  notifyHighValueWaste,
  notifyInventoryStockChange,
} from "./notificationTrigger.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function logWaste({ hotelId, branchId, userId, input }) {
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
    if (qty.lte(0)) {
      throw new ApiError(400, "INVALID_QUANTITY", "quantity must be > 0");
    }

    const qtyInBase = convertToBaseUnit({
      quantity: qty,
      unit,
      baseUnit: item.baseUnit,
    });

    validateInventoryAvailability({
      quantityInStock: item.quantityInStock,
      requiredQtyInBaseUnit: qtyInBase,
    });

    const unitCostCents = toDecimal(item.averageCostPerBaseUnitCents ?? 0);
    const totalCostCents = qtyInBase.mul(unitCostCents);

    const wasteRow = await tx.inventoryConsumption.create({
      data: {
        hotelId,
        branchId: branchId ?? null,
        recipeId: null,
        recipeIngredientId: null,
        inventoryItemId: item.id,
        sourceType: "MANUAL_WASTE",
        sourceId: input.sourceId ?? null,
        quantityConsumed: qtyInBase,
        quantityConsumedBaseUnit: qtyInBase,
        unitCostCents,
        totalCostCents,
      },
    });

    const updatedItem = await adjustInventoryStock({
      tx,
      inventoryItemId: item.id,
      deltaQtyInBaseUnit: qtyInBase.mul(new Decimal(-1)),
    });

    const txn = await createInventoryTransaction({
      tx,
      data: {
        hotelId,
        branchId: branchId ?? null,
        inventoryItemId: item.id,
        type: "WASTE",
        quantity: qty,
        unitId: unit.id,
        quantityInBaseUnit: qtyInBase,
        unitCostPerBaseUnitCents: unitCostCents,
        totalCostCents,
        referenceType: "WASTE_LOG",
        referenceId: wasteRow.id,
        note: input.notes ?? "Waste logged",
        createdByUserId: userId ?? null,
      },
    });

    // Notifications
    await notifyInventoryStockChange({
      tx,
      hotelId,
      branchId,
      inventoryItem: { ...updatedItem, baseUnit: item.baseUnit },
    });

    await notifyHighValueWaste({
      tx,
      hotelId,
      branchId,
      inventoryItem: { id: item.id, name: item.name },
      wasteRow,
      totalCostCents,
    });

    return { waste: wasteRow, transaction: txn };
  });
}

export async function listWaste({ hotelId, branchId, query }) {
  const where = {
    hotelId,
    ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    sourceType: "MANUAL_WASTE",
    ...(query?.inventoryItemId
      ? { inventoryItemId: query.inventoryItemId }
      : {}),
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
      inventoryItem: { select: { id: true, name: true, baseUnit: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function wasteReport({ hotelId, branchId, query }) {
  const rows = await listWaste({ hotelId, branchId, query });

  // Simple grouped report by item.
  const byItem = new Map();
  for (const r of rows) {
    const key = r.inventoryItemId;
    const prev = byItem.get(key) ?? {
      inventoryItemId: r.inventoryItemId,
      name: r.inventoryItem?.name,
      baseUnitSymbol: r.inventoryItem?.baseUnit?.symbol,
      totalQuantityBaseUnit: new Decimal(0),
      totalCostCents: new Decimal(0),
      count: 0,
    };

    prev.totalQuantityBaseUnit = prev.totalQuantityBaseUnit.add(
      toDecimal(r.quantityConsumedBaseUnit),
    );
    prev.totalCostCents = prev.totalCostCents.add(toDecimal(r.totalCostCents));
    prev.count += 1;

    byItem.set(key, prev);
  }

  return {
    totalRows: rows.length,
    items: Array.from(byItem.values()).sort((a, b) =>
      toDecimal(b.totalCostCents).cmp(toDecimal(a.totalCostCents)),
    ),
  };
}
