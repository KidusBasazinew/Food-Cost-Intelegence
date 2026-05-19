import { Decimal, toDecimal } from "../../utils/decimal.js";

export function resolveBranchScope({ authBranchId, queryBranchId }) {
  if (authBranchId) return authBranchId;
  return queryBranchId ?? null;
}

export function resolveDateRange({ from, to, defaultLookbackDays = 30 }) {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - defaultLookbackDays * 24 * 60 * 60 * 1000);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error("Invalid date range");
  }

  // Normalize ordering.
  if (fromDate > toDate) {
    return { from: toDate, to: fromDate };
  }

  return { from: fromDate, to: toDate };
}

export function formatDayUTC(d) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function safeDiv(numerator, denominator) {
  const n = toDecimal(numerator ?? 0);
  const d = toDecimal(denominator ?? 0);
  if (d.lte(0)) return new Decimal(0);
  return n.div(d);
}

export function percent(numerator, denominator) {
  return safeDiv(numerator, denominator).mul(new Decimal(100));
}
