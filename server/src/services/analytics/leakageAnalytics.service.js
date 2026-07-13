import { Prisma } from "@prisma/client";

import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { formatDayUTC, safeDiv } from "./analyticsHelpers.js";
import { classifyVariance } from "../../constants/leakageThresholds.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function clamp01_100(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function scoreColor(score) {
  if (score >= 85) return "green";
  if (score >= 65) return "yellow";
  return "red";
}

function computeLossValueCents({ varianceQty, avgCostPerBaseUnitCents }) {
  const qtyAbs = toDecimal(varianceQty ?? 0).abs();
  const cost = toDecimal(avgCostPerBaseUnitCents ?? 0);
  return qtyAbs.mul(cost);
}

export async function getLeakageDashboard({
  hotelId,
  branchId,
  from,
  to,
  topN = 10,
}) {
  const range = { from, to };

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
    take: 200, // safety cap; dashboard should be time-bounded
  });

  const flat = [];
  for (const c of counts) {
    for (const it of c.items ?? []) {
      const systemQuantity = toDecimal(it.systemQuantity ?? 0);
      const physicalQuantity = toDecimal(it.physicalQuantity ?? 0);
      const varianceQuantity = toDecimal(it.varianceQuantity ?? 0);
      const variancePercentage = toDecimal(it.variancePercentage ?? 0);

      const avgCost = toDecimal(
        it.inventoryItem?.averageCostPerBaseUnitCents ?? 0,
      );
      const lossValueCents = computeLossValueCents({
        varianceQty: varianceQuantity,
        avgCostPerBaseUnitCents: avgCost,
      });

      flat.push({
        stockCountId: c.id,
        countedAt: c.countedAt,
        inventoryItemId: it.inventoryItemId,
        name: it.inventoryItem?.name ?? "Unknown",
        baseUnitSymbol: it.inventoryItem?.baseUnit?.symbol,
        systemQuantity,
        physicalQuantity,
        varianceQuantity,
        variancePercentage,
        varianceAbsPercent: variancePercentage.abs(),
        classification: classifyVariance(variancePercentage.abs()),
        lossValueCents,
        missingQty: varianceQuantity.lt(0)
          ? varianceQuantity.abs()
          : new Decimal(0),
        excessQty: varianceQuantity.gt(0) ? varianceQuantity : new Decimal(0),
      });
    }
  }

  let totalVarianceValueCents = new Decimal(0);
  let totalMissingStock = new Decimal(0);
  let totalExcessStock = new Decimal(0);

  let totalVarianceAbsQty = new Decimal(0);
  let totalSystemQty = new Decimal(0);

  let highRiskItems = 0;
  let criticalVarianceItems = 0;

  for (const r of flat) {
    totalVarianceValueCents = totalVarianceValueCents.add(r.lossValueCents);
    totalMissingStock = totalMissingStock.add(r.missingQty);
    totalExcessStock = totalExcessStock.add(r.excessQty);

    totalVarianceAbsQty = totalVarianceAbsQty.add(r.varianceQuantity.abs());
    totalSystemQty = totalSystemQty.add(r.systemQuantity);

    if (r.classification === "WARNING" || r.classification === "CRITICAL") {
      highRiskItems += 1;
    }
    if (r.classification === "CRITICAL") {
      criticalVarianceItems += 1;
    }
  }

  // Inventory Accuracy % = 100 - (abs(total variance) / total stock) * 100
  const accuracy =
    100 -
    safeDiv(totalVarianceAbsQty, totalSystemQty)
      .mul(new Decimal(100))
      .toNumber();

  // Top lost products (negative variance only)
  const lostByItem = new Map();
  for (const r of flat) {
    if (r.varianceQuantity.gte(0)) continue;
    const prev = lostByItem.get(r.inventoryItemId) ?? {
      inventoryItemId: r.inventoryItemId,
      name: r.name,
      baseUnitSymbol: r.baseUnitSymbol,
      lostQty: new Decimal(0),
      lostValueCents: new Decimal(0),
    };
    prev.lostQty = prev.lostQty.add(r.missingQty);
    prev.lostValueCents = prev.lostValueCents.add(r.lossValueCents);
    lostByItem.set(r.inventoryItemId, prev);
  }

  const topLostProducts = Array.from(lostByItem.values())
    .sort((a, b) =>
      toDecimal(b.lostValueCents).cmp(toDecimal(a.lostValueCents)),
    )
    .slice(0, Math.max(1, Math.min(50, Number(topN) || 10)));

  // Variance trend by day
  const varianceTrendMap = new Map();
  for (const r of flat) {
    const day = formatDayUTC(new Date(r.countedAt));
    const prev = varianceTrendMap.get(day) ?? {
      day,
      varianceValueCents: new Decimal(0),
      missingValueCents: new Decimal(0),
      excessValueCents: new Decimal(0),
    };

    prev.varianceValueCents = prev.varianceValueCents.add(r.lossValueCents);

    if (r.varianceQuantity.lt(0)) {
      prev.missingValueCents = prev.missingValueCents.add(r.lossValueCents);
    } else if (r.varianceQuantity.gt(0)) {
      prev.excessValueCents = prev.excessValueCents.add(r.lossValueCents);
    }

    varianceTrendMap.set(day, prev);
  }

  const varianceTrend = Array.from(varianceTrendMap.values()).sort((a, b) =>
    a.day.localeCompare(b.day),
  );

  // Waste trend by day (SQL for scalability)
  const wasteTrend = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as day,
        COALESCE(SUM("totalCostCents"), 0) as "wasteCostCents"
      FROM "InventoryConsumption"
      WHERE "hotelId" = ${hotelId}
        AND "sourceType" = 'MANUAL_WASTE'
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
        ${branchId ? Prisma.sql`AND ("branchId" = ${branchId} OR "branchId" IS NULL)` : Prisma.empty}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  );

  // Latest stock counts
  const latestStockCounts = await prisma.stockCount.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      status: "COMPLETED",
    },
    orderBy: [{ countedAt: "desc" }],
    take: 5,
    include: {
      _count: { select: { items: true } },
    },
  });

  // Leakage score (use latest completed count in the requested range; fallback to latest overall)
  const latestInRange = [...counts]
    .reverse()
    .find((c) => c.status === "COMPLETED");
  const scoreBase = latestInRange
    ? latestInRange
    : await prisma.stockCount.findFirst({
        where: {
          ...withBranchScope({ hotelId, branchId }),
          status: "COMPLETED",
        },
        orderBy: [{ countedAt: "desc" }],
        include: {
          items: true,
        },
      });

  let integrityScore = 100;
  if (scoreBase?.items?.length) {
    for (const it of scoreBase.items) {
      const absPct = toDecimal(it.variancePercentage ?? 0).abs();
      const cls = classifyVariance(absPct);
      if (cls === "WATCH") integrityScore -= 2;
      if (cls === "WARNING") integrityScore -= 5;
      if (cls === "CRITICAL") integrityScore -= 10;
    }
  }

  integrityScore = clamp01_100(integrityScore);

  // Estimated loss windows based on completed stock counts
  const now = new Date();
  const todayFrom = startOfDayLocal(now);
  const todayTo = endOfDayLocal(now);
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearFrom = new Date(now.getFullYear(), 0, 1);

  function sumLossInWindow(wFrom, wTo) {
    let sum = new Decimal(0);
    for (const r of flat) {
      const t = new Date(r.countedAt).getTime();
      if (t < wFrom.getTime() || t > wTo.getTime()) continue;
      sum = sum.add(r.lossValueCents);
    }
    return sum;
  }

  const estimatedLossTodayCents = sumLossInWindow(todayFrom, todayTo);
  const estimatedLossThisMonthCents = sumLossInWindow(monthFrom, now);
  const estimatedLossThisYearCents = sumLossInWindow(yearFrom, now);

  // Variance table (most risky first)
  const varianceTable = flat
    .slice()
    .sort((a, b) => b.varianceAbsPercent.cmp(a.varianceAbsPercent))
    .slice(0, 200);

  return {
    range,
    kpis: {
      totalVarianceValueCents,
      totalMissingStock,
      totalExcessStock,
      highRiskItems,
      criticalVarianceItems,
      inventoryAccuracyPercent: clamp01_100(accuracy),
    },
    loss: {
      estimatedLossTodayCents,
      estimatedLossThisMonthCents,
      estimatedLossThisYearCents,
    },
    score: {
      inventoryIntegrityScore: integrityScore,
      color: scoreColor(integrityScore),
    },
    charts: {
      topLostProducts,
      varianceTrend,
      wasteTrend,
    },
    tables: {
      varianceTable,
    },
    latestStockCounts,
  };
}
