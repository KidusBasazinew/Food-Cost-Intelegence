import { Decimal, toDecimal } from "../utils/decimal.js";

export function calculateProfitCents({ sellingPriceCents, totalCostCents }) {
  const selling = toDecimal(sellingPriceCents ?? 0);
  const cost = toDecimal(totalCostCents ?? 0);
  return selling.sub(cost);
}

export function calculateProfitMarginPercent({
  sellingPriceCents,
  profitCents,
}) {
  const selling = toDecimal(sellingPriceCents ?? 0);
  const profit = toDecimal(profitCents ?? 0);

  if (selling.lte(0)) return new Decimal(0);

  // (profit / sellingPrice) * 100
  return profit.div(selling).mul(new Decimal(100));
}
