import { Decimal, toDecimal } from "../utils/decimal.js";

export function calculateCostPerYieldUnit({ totalCostCents, yieldQuantity }) {
  const cost = toDecimal(totalCostCents ?? 0);
  const yieldQty = toDecimal(yieldQuantity ?? 1);

  if (yieldQty.lte(0)) return new Decimal(0);

  // totalCost / yieldQuantity
  return cost.div(yieldQty);
}

export function calculateProfitPerYieldUnit({
  sellingPriceCents,
  costPerYieldUnit,
}) {
  const selling = toDecimal(sellingPriceCents ?? 0);
  const costPer = toDecimal(costPerYieldUnit ?? 0);

  // sellingPrice - costPerYieldUnit
  return selling.sub(costPer);
}

export function calculateFoodCostPercentage({
  costPerYieldUnit,
  sellingPriceCents,
}) {
  const selling = toDecimal(sellingPriceCents ?? 0);
  const costPer = toDecimal(costPerYieldUnit ?? 0);

  if (selling.lte(0)) return new Decimal(0);

  // (costPerYieldUnit / sellingPrice) * 100
  return costPer.div(selling).mul(new Decimal(100));
}

export function withRecipeYieldMetrics(recipe) {
  if (!recipe) return recipe;

  const costPerYieldUnit = calculateCostPerYieldUnit({
    totalCostCents: recipe.totalCostCents,
    yieldQuantity: recipe.yieldQuantity,
  });

  const profitPerYieldUnit = calculateProfitPerYieldUnit({
    sellingPriceCents: recipe.sellingPriceCents,
    costPerYieldUnit,
  });

  const foodCostPercentage = calculateFoodCostPercentage({
    costPerYieldUnit,
    sellingPriceCents: recipe.sellingPriceCents,
  });

  return {
    ...recipe,
    costPerYieldUnit,
    profitPerYieldUnit,
    foodCostPercentage,
  };
}
