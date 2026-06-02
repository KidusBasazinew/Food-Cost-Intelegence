import { prisma } from "../prisma/client.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import {
  getFoodCostKPIs,
  getInventoryValuation,
} from "./analytics/foodCostAnalytics.service.js";
import { getWasteAnalytics } from "./analytics/wasteAnalytics.service.js";
import { getMenuEngineering } from "./analytics/menuEngineering.service.js";
import { getSupplierAnalytics } from "./analytics/supplierAnalytics.service.js";
import { getInventoryForecast } from "./analytics/inventoryForecast.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export function listAvailableReports() {
  return [
    {
      type: "FOOD_COST",
      name: "Food Cost Summary",
      description: "Revenue, ingredient costs, food cost %, gross profit",
    },
    {
      type: "WASTE",
      name: "Waste Summary",
      description: "Waste losses, top wasted ingredients, waste %",
    },
    {
      type: "MENU_PROFITABILITY",
      name: "Menu Profitability",
      description: "Menu engineering matrix and profitability ranking",
    },
    {
      type: "PURCHASES",
      name: "Purchase Trends",
      description: "Daily purchase totals and high spend days",
    },
    {
      type: "SUPPLIERS",
      name: "Supplier Analytics",
      description: "Supplier spending and price history",
    },
    {
      type: "INVENTORY_VALUATION",
      name: "Inventory Valuation",
      description: "Current inventory valuation based on weighted average cost",
    },
    {
      type: "KITCHEN_PERFORMANCE",
      name: "Kitchen Performance",
      description: "Throughput, cost trends, low stock risks",
    },
    {
      type: "LEAKAGE",
      name: "Inventory Leakage / Variance",
      description:
        "Stock count variances, missing stock, and estimated loss value",
    },
  ];
}

export async function buildReport({
  hotelId,
  branchId,
  type,
  from,
  to,
  filter,
}) {
  if (type === "FOOD_COST") {
    const kpis = await getFoodCostKPIs({ hotelId, branchId, from, to });
    return {
      title: "Food Cost Report",
      rows: [
        {
          totalFoodRevenueCents: kpis.totalFoodRevenueCents,
          totalIngredientCostCents: kpis.totalIngredientCostCents,
          foodCostPercentage: kpis.foodCostPercentage,
          grossProfitCents: kpis.grossProfitCents,
          grossMarginPercentage: kpis.grossMarginPercentage,
          wasteLossCents: kpis.wasteLossCents,
          netOperationalProfitCents: kpis.netOperationalProfitCents,
        },
      ],
    };
  }

  if (type === "WASTE") {
    const report = await getWasteAnalytics({
      hotelId,
      branchId,
      from,
      to,
      filter,
    });
    return {
      title: "Waste Report",
      rows: report.topWastedIngredients,
      meta: {
        wasteCostCents: report.wasteCostCents,
        purchasedCostCents: report.purchasedCostCents,
        wastePercentage: report.wastePercentage,
      },
    };
  }

  if (type === "MENU_PROFITABILITY") {
    const report = await getMenuEngineering({
      hotelId,
      branchId,
      from,
      to,
      filter,
    });
    return {
      title: "Menu Profitability Report",
      rows: report.items,
      meta: report.totals,
    };
  }

  if (type === "SUPPLIERS") {
    const report = await getSupplierAnalytics({
      hotelId,
      branchId,
      from,
      to,
      filter,
    });
    return {
      title: "Supplier Report",
      rows: report.supplierSpending,
      meta: {
        purchaseTrendDaily: report.purchaseTrendDaily,
        priceHistory: report.priceHistory,
      },
    };
  }

  if (type === "INVENTORY_VALUATION") {
    const valuation = await getInventoryValuation({ hotelId, branchId });
    return {
      title: "Inventory Valuation",
      rows: [valuation],
    };
  }

  if (type === "PURCHASES") {
    const purchases = await prisma.purchase.findMany({
      where: {
        ...withBranchScope({ hotelId, branchId }),
        status: "RECEIVED",
        OR: [
          { receivedAt: { gte: from, lte: to } },
          { receivedAt: null, createdAt: { gte: from, lte: to } },
        ],
      },
      select: {
        id: true,
        supplierId: true,
        totalCents: true,
        receivedAt: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "asc" }],
    });

    return {
      title: "Purchase Report",
      rows: purchases.map((p) => ({
        id: p.id,
        supplierId: p.supplierId,
        totalCents: toDecimal(p.totalCents ?? 0),
        date: (p.receivedAt ?? p.createdAt)?.toISOString(),
      })),
    };
  }

  if (type === "KITCHEN_PERFORMANCE") {
    const [foodKpis, waste, forecast] = await Promise.all([
      getFoodCostKPIs({ hotelId, branchId, from, to }),
      getWasteAnalytics({ hotelId, branchId, from, to, filter }),
      getInventoryForecast({
        hotelId,
        branchId,
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
          lookbackDays: 30,
          topN: 50,
        },
      }),
    ]);

    const throughput = toDecimal(foodKpis.totalFoodSalesCount ?? 0);
    const wasteRatio =
      foodKpis.totalIngredientCostCents instanceof Decimal
        ? foodKpis.totalIngredientCostCents.lte(0)
          ? new Decimal(0)
          : toDecimal(waste.wasteCostCents).div(
              toDecimal(foodKpis.totalIngredientCostCents),
            )
        : new Decimal(0);

    return {
      title: "Kitchen Performance Report",
      rows: [
        {
          totalFoodSalesCount: throughput,
          totalFoodRevenueCents: foodKpis.totalFoodRevenueCents,
          ingredientCostCents: foodKpis.totalIngredientCostCents,
          wasteLossCents: waste.wasteCostCents,
          wasteToCogsRatio: wasteRatio,
          lowStockRisksCount: forecast.items.length,
        },
      ],
      meta: {
        lowStockRisks: forecast.items,
      },
    };
  }

  if (type === "LEAKAGE") {
    const counts = await prisma.stockCount.findMany({
      where: {
        ...withBranchScope({ hotelId, branchId }),
        status: "COMPLETED",
        countedAt: { gte: from, lte: to },
      },
      include: {
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                name: true,
                averageCostPerBaseUnitCents: true,
                baseUnit: { select: { symbol: true } },
              },
            },
          },
        },
      },
      orderBy: [{ countedAt: "asc" }],
      take: 200,
    });

    const rows = [];

    for (const c of counts) {
      for (const it of c.items ?? []) {
        const varianceQty = toDecimal(it.varianceQuantity ?? 0);
        const avgCost = toDecimal(
          it.inventoryItem?.averageCostPerBaseUnitCents ?? 0,
        );
        const lossValueCents = varianceQty.abs().mul(avgCost);

        rows.push({
          stockCountId: c.id,
          countedAt: c.countedAt?.toISOString(),
          inventoryItemId: it.inventoryItemId,
          itemName: it.inventoryItem?.name,
          baseUnitSymbol: it.inventoryItem?.baseUnit?.symbol,
          systemQuantity: toDecimal(it.systemQuantity ?? 0),
          physicalQuantity: toDecimal(it.physicalQuantity ?? 0),
          varianceQuantity: varianceQty,
          variancePercentage: toDecimal(it.variancePercentage ?? 0),
          varianceLossValueCents: lossValueCents,
        });
      }
    }

    return {
      title: "Inventory Leakage / Variance Report",
      rows,
    };
  }

  return { title: "Report", rows: [] };
}
