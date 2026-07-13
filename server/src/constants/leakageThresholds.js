import { Decimal } from "../utils/decimal.js";

// Central thresholds (NO TABLE) — required by Stage 8 spec.
export const LOW_VARIANCE_PERCENT = new Decimal(3);
export const MEDIUM_VARIANCE_PERCENT = new Decimal(7);
export const HIGH_VARIANCE_PERCENT = new Decimal(15);

export function classifyVariance(absPercent) {
  const p =
    absPercent instanceof Decimal ? absPercent : new Decimal(absPercent);

  if (p.lte(LOW_VARIANCE_PERCENT)) return "NORMAL";
  if (p.lte(MEDIUM_VARIANCE_PERCENT)) return "WATCH";
  if (p.lt(HIGH_VARIANCE_PERCENT)) return "WARNING";
  return "CRITICAL";
}
