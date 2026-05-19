import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { percent, formatDayUTC } from "./analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function getWasteAnalytics({
  hotelId,
  branchId,
  from,
  to,
  filter,
}) {
  const where = {
    ...withBranchScope({ hotelId, branchId }),
    sourceType: "MANUAL_WASTE",
    createdAt: { gte: from, lte: to },
    ...(filter?.inventoryItemId
      ? { inventoryItemId: filter.inventoryItemId }
      : {}),
  };

  const wasteAgg = await prisma.inventoryConsumption.aggregate({
    where,
    _sum: { totalCostCents: true },
  });
  const wasteCostCents = toDecimal(wasteAgg._sum.totalCostCents ?? 0);

  const byItem = await prisma.inventoryConsumption.groupBy({
    by: ["inventoryItemId"],
    where,
    _sum: { totalCostCents: true, quantityConsumedBaseUnit: true },
    orderBy: { _sum: { totalCostCents: "desc" } },
  });

  const itemIds = byItem.map((r) => r.inventoryItemId);
  const items = itemIds.length
    ? await prisma.inventoryItem.findMany({
        where: { id: { in: itemIds } },
        select: {
          id: true,
          name: true,
          baseUnit: { select: { symbol: true } },
        },
      })
    : [];
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const topN = Number(filter?.topN ?? 20);
  const topItems = byItem.slice(0, topN).map((r) => {
    const item = itemMap.get(r.inventoryItemId);
    return {
      inventoryItemId: r.inventoryItemId,
      name: item?.name ?? "Unknown",
      baseUnitSymbol: item?.baseUnit?.symbol,
      totalWasteCostCents: toDecimal(r._sum.totalCostCents ?? 0),
      totalWasteQuantityBaseUnit: toDecimal(
        r._sum.quantityConsumedBaseUnit ?? 0,
      ),
    };
  });

  // Waste percentage: waste cost / total purchased inventory cost
  const purchaseAgg = await prisma.purchase.aggregate({
    where: {
      hotelId,
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
      status: "RECEIVED",
      OR: [
        { receivedAt: { gte: from, lte: to } },
        { receivedAt: null, createdAt: { gte: from, lte: to } },
      ],
    },
    _sum: { totalCents: true },
  });
  const purchasedCostCents = toDecimal(purchaseAgg._sum.totalCents ?? 0);
  const wastePercentage = percent(wasteCostCents, purchasedCostCents);

  // Daily trend (JS grouping for portability)
  const rows = await prisma.inventoryConsumption.findMany({
    where,
    select: { createdAt: true, totalCostCents: true },
    orderBy: [{ createdAt: "asc" }],
  });
  const dailyMap = new Map();
  for (const r of rows) {
    const day = formatDayUTC(new Date(r.createdAt));
    const prev = dailyMap.get(day) ?? new Decimal(0);
    dailyMap.set(day, prev.add(toDecimal(r.totalCostCents ?? 0)));
  }
  const dailyTrend = Array.from(dailyMap.entries()).map(([day, cost]) => ({
    day,
    wasteCostCents: cost,
  }));

  return {
    wasteCostCents,
    purchasedCostCents,
    wastePercentage,
    topWastedIngredients: topItems,
    dailyTrend,
  };
}
