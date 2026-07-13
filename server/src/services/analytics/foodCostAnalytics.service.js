import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { percent } from "./analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function getFoodCostKPIs({ hotelId, branchId, from, to }) {
  const orderWhere = {
    salesOrder: {
      hotelId,
      ...(branchId ? { branchId } : {}),
      status: "COMPLETED",
      orderedAt: { gte: from, lte: to },
    },
  };

  const salesAgg = await prisma.salesOrderItem.aggregate({
    where: orderWhere,
    _sum: { totalRevenueCents: true, quantity: true },
  });

  const totalFoodRevenueCents = toDecimal(salesAgg._sum.totalRevenueCents ?? 0);
  const totalFoodSalesCount = toDecimal(salesAgg._sum.quantity ?? 0);

  // Ingredient cost (COGS) from actual consumption rows if sales ingestion triggers consumption.
  // If consumption is not connected yet, this will be 0 and dashboards will surface that gap.
  const cogsAgg = await prisma.inventoryConsumption.aggregate({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      sourceType: "ORDER",
      createdAt: { gte: from, lte: to },
    },
    _sum: { totalCostCents: true },
  });
  const totalIngredientCostCents = toDecimal(cogsAgg._sum.totalCostCents ?? 0);

  const wasteAgg = await prisma.inventoryConsumption.aggregate({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      sourceType: "MANUAL_WASTE",
      createdAt: { gte: from, lte: to },
    },
    _sum: { totalCostCents: true },
  });
  const wasteLossCents = toDecimal(wasteAgg._sum.totalCostCents ?? 0);

  const grossProfitCents = totalFoodRevenueCents.sub(totalIngredientCostCents);

  // Net operational profit: gross profit - waste (kept conservative; purchases are not expensed here).
  const netOperationalProfitCents = grossProfitCents.sub(wasteLossCents);

  const foodCostPercentage = percent(
    totalIngredientCostCents,
    totalFoodRevenueCents,
  );

  const grossMarginPercentage = percent(
    grossProfitCents,
    totalFoodRevenueCents,
  );

  return {
    totalFoodSalesCount,
    totalFoodRevenueCents,
    totalIngredientCostCents,
    foodCostPercentage,
    grossProfitCents,
    grossMarginPercentage,
    wasteLossCents,
    netOperationalProfitCents,
  };
}

export async function getInventoryValuation({ hotelId, branchId }) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      hotelId,
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    },
    select: {
      id: true,
      quantityInStock: true,
      averageCostPerBaseUnitCents: true,
    },
  });

  let totalValueCents = new Decimal(0);
  for (const i of items) {
    const qty = toDecimal(i.quantityInStock ?? 0);
    const cost = toDecimal(i.averageCostPerBaseUnitCents ?? 0);
    totalValueCents = totalValueCents.add(qty.mul(cost));
  }

  return { inventoryValueCents: totalValueCents };
}
