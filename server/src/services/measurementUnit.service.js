import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";

const Decimal = Prisma.Decimal;

function toDecimal(value) {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") return new Decimal(value);
  if (typeof value === "string") return new Decimal(value);
  throw new ApiError(400, "INVALID_INPUT", "Invalid numeric value");
}

export async function listMeasurementUnits() {
  return prisma.measurementUnit.findMany({
    orderBy: [{ baseType: "asc" }, { isBaseUnit: "desc" }, { name: "asc" }],
  });
}

export async function getMeasurementUnitById(id) {
  const unit = await prisma.measurementUnit.findUnique({ where: { id } });
  if (!unit) throw new ApiError(404, "NOT_FOUND", "Measurement unit not found");
  return unit;
}

export async function createMeasurementUnit(input) {
  const conversionFactor = toDecimal(input.conversionFactor ?? 1);
  if (conversionFactor.lte(0)) {
    throw new ApiError(
      400,
      "INVALID_CONVERSION_FACTOR",
      "conversionFactor must be > 0",
    );
  }

  if (input.isBaseUnit && !conversionFactor.eq(1)) {
    throw new ApiError(
      400,
      "INVALID_BASE_UNIT",
      "Base units must have conversionFactor=1",
    );
  }

  return prisma.measurementUnit.create({
    data: {
      name: input.name,
      symbol: input.symbol,
      baseType: input.baseType,
      conversionFactor,
      isBaseUnit: Boolean(input.isBaseUnit),
    },
  });
}

export async function updateMeasurementUnit(id, input) {
  const data = { ...input };

  const wantsBaseUnit = data.isBaseUnit === true;

  if (data.conversionFactor != null) {
    const conversionFactor = toDecimal(data.conversionFactor);
    if (conversionFactor.lte(0)) {
      throw new ApiError(
        400,
        "INVALID_CONVERSION_FACTOR",
        "conversionFactor must be > 0",
      );
    }

    if (wantsBaseUnit && !conversionFactor.eq(1)) {
      throw new ApiError(
        400,
        "INVALID_BASE_UNIT",
        "Base units must have conversionFactor=1",
      );
    }

    data.conversionFactor = conversionFactor;
  }

  if (wantsBaseUnit && data.conversionFactor == null) {
    const existing = await prisma.measurementUnit.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Measurement unit not found");
    }
    if (!toDecimal(existing.conversionFactor).eq(1)) {
      throw new ApiError(
        400,
        "INVALID_BASE_UNIT",
        "Base units must have conversionFactor=1",
      );
    }
  }

  try {
    const updated = await prisma.measurementUnit.update({
      where: { id },
      data,
    });
    return updated;
  } catch (err) {
    if (err?.code === "P2025") {
      throw new ApiError(404, "NOT_FOUND", "Measurement unit not found");
    }
    throw err;
  }
}

export async function deleteMeasurementUnit(id) {
  try {
    await prisma.measurementUnit.delete({ where: { id } });
  } catch (err) {
    if (err?.code === "P2025") {
      throw new ApiError(404, "NOT_FOUND", "Measurement unit not found");
    }
    throw err;
  }
}
