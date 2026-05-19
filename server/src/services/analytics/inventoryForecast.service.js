import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { resolveDateRange } from "./analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function getInventoryForecast({ hotelId, branchId, query }) {
  const lookbackDays = Number(query?.lookbackDays ?? 30);
  const days =
    Number.isFinite(lookbackDays) && lookbackDays > 0 ? lookbackDays : 30;

  const { from, to } = resolveDateRange({
    from: query?.from,
    to: query?.to,
    defaultLookbackDays: days,
  });

  const consumption = await prisma.inventoryConsumption.groupBy({
    by: ["inventoryItemId"],
    where: {
      ...withBranchScope({ hotelId, branchId }),
      createdAt: { gte: from, lte: to },
      ...(query?.inventoryItemId
        ? { inventoryItemId: query.inventoryItemId }
        : {}),
    },
    _sum: { quantityConsumedBaseUnit: true },
  });

  const ids = consumption.map((c) => c.inventoryItemId);
  const items = ids.length
    ? await prisma.inventoryItem.findMany({
        where: {
          id: { in: ids },
          hotelId,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
        },
        include: { baseUnit: true },
      })
    : [];
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const rows = consumption
    .map((c) => {
      const item = itemMap.get(c.inventoryItemId);
      const totalQty = toDecimal(c._sum.quantityConsumedBaseUnit ?? 0);
      const avgDaily = totalQty.div(new Decimal(days));
      const inStock = toDecimal(item?.quantityInStock ?? 0);
      const estimatedDaysRemaining = avgDaily.lte(0)
        ? new Decimal(0)
        : inStock.div(avgDaily);

      return {
        inventoryItemId: c.inventoryItemId,
        name: item?.name ?? "Unknown",
        baseUnitSymbol: item?.baseUnit?.symbol,
        quantityInStock: inStock,
        averageDailyConsumption: avgDaily,
        estimatedDaysRemaining,
        projectedWeeklyUsage: avgDaily.mul(new Decimal(7)),
        projectedMonthlyUsage: avgDaily.mul(new Decimal(30)),
      };
    })
    .sort((a, b) =>
      toDecimal(a.estimatedDaysRemaining).cmp(
        toDecimal(b.estimatedDaysRemaining),
      ),
    );

  const topN = Number(query?.topN ?? 50);

  return {
    from,
    to,
    lookbackDays: days,
    items: rows.slice(0, topN),
  };
}

export async function generateInventoryForecastSnapshots({
  hotelId,
  branchId,
  from,
  to,
  lookbackDays,
}) {
  if (!branchId) {
    return { created: 0, warning: "branchId is required to persist snapshots" };
  }

  const report = await getInventoryForecast({
    hotelId,
    branchId,
    query: {
      from: from.toISOString(),
      to: to.toISOString(),
      lookbackDays,
      topN: 1000,
    },
  });

  if (!report.items.length) return { created: 0 };

  const created = await prisma.inventoryForecastSnapshot.createMany({
    data: report.items.map((i) => ({
      inventoryItemId: i.inventoryItemId,
      branchId,
      averageDailyConsumption: i.averageDailyConsumption,
      estimatedDaysRemaining: i.estimatedDaysRemaining,
      projectedWeeklyUsage: i.projectedWeeklyUsage,
      projectedMonthlyUsage: i.projectedMonthlyUsage,
    })),
  });

  return { created: created.count };
}

export async function getLowStockAlerts({ hotelId, branchId }) {
  const rows = await prisma.inventoryItem.findMany({
    where: {
      hotelId,
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    },
    include: { baseUnit: true },
    orderBy: [{ updatedAt: "asc" }],
    take: 500,
  });

  return rows
    .filter((r) =>
      toDecimal(r.quantityInStock ?? 0).lte(
        toDecimal(r.minimumStockLevel ?? 0),
      ),
    )
    .slice(0, 50);
}
