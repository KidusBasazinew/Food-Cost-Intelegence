import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { formatDayUTC } from "./analyticsHelpers.js";
import {
  getFoodCostKPIs,
  getInventoryValuation,
} from "./foodCostAnalytics.service.js";
import { getMenuEngineering } from "./menuEngineering.service.js";
import { getWasteAnalytics } from "./wasteAnalytics.service.js";
import { getInventoryForecast } from "./inventoryForecast.service.js";
import { getSupplierAnalytics } from "./supplierAnalytics.service.js";

export async function getExecutiveDashboard({
  hotelId,
  branchId,
  from,
  to,
  filter,
}) {
  const [
    foodKpis,
    inventoryValuation,
    menuEngineering,
    waste,
    forecast,
    suppliers,
  ] = await Promise.all([
    getFoodCostKPIs({ hotelId, branchId, from, to }),
    getInventoryValuation({ hotelId, branchId }),
    getMenuEngineering({
      hotelId,
      branchId,
      from,
      to,
      filter: {
        menuCategory: filter?.menuCategory,
        topN: filter?.topN,
      },
    }),
    getWasteAnalytics({
      hotelId,
      branchId,
      from,
      to,
      filter: {
        inventoryItemId: filter?.inventoryItemId,
        topN: filter?.topN,
      },
    }),
    getInventoryForecast({
      hotelId,
      branchId,
      query: {
        from: from.toISOString(),
        to: to.toISOString(),
        lookbackDays: filter?.lookbackDays ?? 30,
        topN: filter?.topN,
      },
    }),
    getSupplierAnalytics({
      hotelId,
      branchId,
      from,
      to,
      filter: {
        supplierId: filter?.supplierId,
        inventoryItemId: filter?.inventoryItemId,
        topN: filter?.topN,
      },
    }),
  ]);

  // Daily revenue trend
  const orders = await prisma.salesOrder.findMany({
    where: {
      hotelId,
      ...(branchId ? { branchId } : {}),
      status: "COMPLETED",
      orderedAt: { gte: from, lte: to },
    },
    select: { orderedAt: true, totalRevenueCents: true },
    orderBy: [{ orderedAt: "asc" }],
  });

  const revMap = new Map();
  for (const o of orders) {
    const day = formatDayUTC(new Date(o.orderedAt));
    const prev = revMap.get(day) ?? new Decimal(0);
    revMap.set(day, prev.add(toDecimal(o.totalRevenueCents ?? 0)));
  }
  const dailyRevenue = Array.from(revMap.entries()).map(([day, v]) => ({
    day,
    revenueCents: v,
  }));

  // Daily ingredient cost trend (COGS)
  const consumptions = await prisma.inventoryConsumption.findMany({
    where: {
      hotelId,
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
      sourceType: "ORDER",
      createdAt: { gte: from, lte: to },
    },
    select: { createdAt: true, totalCostCents: true },
    orderBy: [{ createdAt: "asc" }],
  });
  const costMap = new Map();
  for (const r of consumptions) {
    const day = formatDayUTC(new Date(r.createdAt));
    const prev = costMap.get(day) ?? new Decimal(0);
    costMap.set(day, prev.add(toDecimal(r.totalCostCents ?? 0)));
  }
  const dailyIngredientCost = Array.from(costMap.entries()).map(([day, v]) => ({
    day,
    ingredientCostCents: v,
  }));

  return {
    range: { from, to },
    kpis: {
      ...foodKpis,
      ...inventoryValuation,
    },
    charts: {
      dailyRevenue,
      dailyIngredientCost,
      dailyWasteCost: waste.dailyTrend,
      purchaseTrendDaily: suppliers.purchaseTrendDaily,
      menuCategoryCounts: menuEngineering.categoryCounts,
    },
    insights: {
      topProfitableMeals: menuEngineering.topProfitable,
      mostWastedIngredients: waste.topWastedIngredients,
      lowStockForecast: forecast.items,
      supplierSpending: suppliers.supplierSpending,
    },
  };
}
