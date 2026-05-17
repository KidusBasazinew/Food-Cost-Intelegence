import { Prisma } from "@prisma/client";

import { ApiError } from "../utils/apiError.js";

const Decimal = Prisma.Decimal;

function toDecimal(value) {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") return new Decimal(value);
  if (typeof value === "bigint") return new Decimal(value.toString());
  throw new ApiError(400, "INVALID_INPUT", "Invalid numeric value");
}

export function convertToBaseUnit({ quantity, unit, baseUnit }) {
  if (!unit || !baseUnit) {
    throw new ApiError(400, "INVALID_UNIT", "Missing unit/base unit");
  }

  if (unit.baseType !== baseUnit.baseType) {
    throw new ApiError(
      400,
      "UNIT_MISMATCH",
      "Unit base type does not match item base unit",
    );
  }

  const qty = toDecimal(quantity);
  const unitFactor = toDecimal(unit.conversionFactor);
  const baseFactor = toDecimal(baseUnit.conversionFactor);

  if (unitFactor.lte(0) || baseFactor.lte(0)) {
    throw new ApiError(400, "INVALID_UNIT", "Invalid conversion factor");
  }

  // quantityInBase = quantity * (unitFactor / baseFactor)
  return qty.mul(unitFactor).div(baseFactor);
}

export function calculateAverageCost({
  currentQtyInBaseUnit,
  currentAvgCostPerBaseUnitCents,
  receivedQtyInBaseUnit,
  receivedUnitCostPerBaseUnitCents,
}) {
  const currentQty = toDecimal(currentQtyInBaseUnit);
  const currentAvg = toDecimal(currentAvgCostPerBaseUnitCents);
  const receivedQty = toDecimal(receivedQtyInBaseUnit);
  const receivedUnitCost = toDecimal(receivedUnitCostPerBaseUnitCents);

  if (receivedQty.lte(0)) return currentAvg;

  const newQty = currentQty.add(receivedQty);
  if (newQty.lte(0)) return new Decimal(0);

  const currentValue = currentQty.mul(currentAvg);
  const receivedValue = receivedQty.mul(receivedUnitCost);
  return currentValue.add(receivedValue).div(newQty);
}

export function validateInventoryAvailability({
  quantityInStock,
  requiredQtyInBaseUnit,
}) {
  const stock = toDecimal(quantityInStock);
  const required = toDecimal(requiredQtyInBaseUnit);

  if (required.lte(0)) {
    throw new ApiError(400, "INVALID_QUANTITY", "Quantity must be > 0");
  }

  if (stock.lt(required)) {
    throw new ApiError(400, "INSUFFICIENT_STOCK", "Insufficient stock");
  }
}

export function checkLowStock({ quantityInStock, minimumStockLevel }) {
  const stock = toDecimal(quantityInStock);
  const min = toDecimal(minimumStockLevel);
  return min.gt(0) && stock.lte(min);
}

export async function createInventoryTransaction({ prisma, data, tx } = {}) {
  const client = tx ?? prisma;
  if (!client) throw new Error("Missing Prisma client");

  return client.inventoryTransaction.create({
    data,
  });
}

export async function adjustInventoryStock({
  prisma,
  tx,
  inventoryItemId,
  deltaQtyInBaseUnit,
  nextAvgCostPerBaseUnitCents,
}) {
  const client = tx ?? prisma;
  if (!client) throw new Error("Missing Prisma client");

  const delta = toDecimal(deltaQtyInBaseUnit);

  return client.inventoryItem.update({
    where: { id: inventoryItemId },
    data: {
      quantityInStock: { increment: delta },
      ...(nextAvgCostPerBaseUnitCents != null
        ? {
            averageCostPerBaseUnitCents: toDecimal(nextAvgCostPerBaseUnitCents),
          }
        : {}),
    },
  });
}
