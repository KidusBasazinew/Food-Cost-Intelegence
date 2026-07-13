import { Prisma } from "@prisma/client";

import { ApiError } from "./apiError.js";

export const Decimal = Prisma.Decimal;

export function toDecimal(value) {
  if (value instanceof Decimal) return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ApiError(400, "INVALID_INPUT", "Invalid numeric value");
    }
    return new Decimal(value);
  }
  if (typeof value === "string") return new Decimal(value);
  if (typeof value === "bigint") return new Decimal(value.toString());
  throw new ApiError(400, "INVALID_INPUT", "Invalid numeric value");
}

export function decimalMax(a, b) {
  const da = toDecimal(a);
  const db = toDecimal(b);
  return da.gte(db) ? da : db;
}
