import { Decimal, toDecimal } from "../../utils/decimal.js";
import { getFoodCostKPIs } from "./foodCostAnalytics.service.js";
import { getWasteAnalytics } from "./wasteAnalytics.service.js";
import {
  getInventoryForecast,
  getLowStockAlerts,
} from "./inventoryForecast.service.js";

export async function getKitchenPerformance({ hotelId, branchId, from, to }) {
  const [food, waste, forecast, lowStock] = await Promise.all([
    getFoodCostKPIs({ hotelId, branchId, from, to }),
    getWasteAnalytics({ hotelId, branchId, from, to, filter: { topN: 10 } }),
    getInventoryForecast({
      hotelId,
      branchId,
      query: {
        from: from.toISOString(),
        to: to.toISOString(),
        lookbackDays: 30,
        topN: 10,
      },
    }),
    getLowStockAlerts({ hotelId, branchId }),
  ]);

  const cogs = toDecimal(food.totalIngredientCostCents ?? 0);
  const wasteLoss = toDecimal(waste.wasteCostCents ?? 0);
  const wasteToCogsRatio = cogs.lte(0) ? new Decimal(0) : wasteLoss.div(cogs);

  return {
    throughputSalesCount: toDecimal(food.totalFoodSalesCount ?? 0),
    revenueCents: toDecimal(food.totalFoodRevenueCents ?? 0),
    ingredientCostCents: cogs,
    wasteLossCents: wasteLoss,
    wasteToCogsRatio,
    lowStockCount: lowStock.length,
    depletionRisks: forecast.items,
    topWastedIngredients: waste.topWastedIngredients,
  };
}
