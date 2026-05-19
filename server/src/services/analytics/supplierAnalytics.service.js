import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { formatDayUTC } from "./analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function getSupplierAnalytics({
  hotelId,
  branchId,
  from,
  to,
  filter,
}) {
  const purchaseWhere = {
    ...withBranchScope({ hotelId, branchId }),
    status: "RECEIVED",
    ...(filter?.supplierId ? { supplierId: filter.supplierId } : {}),
    OR: [
      { receivedAt: { gte: from, lte: to } },
      { receivedAt: null, createdAt: { gte: from, lte: to } },
    ],
  };

  const spending = await prisma.purchase.groupBy({
    by: ["supplierId"],
    where: purchaseWhere,
    _sum: { totalCents: true },
    _count: { _all: true },
    orderBy: { _sum: { totalCents: "desc" } },
  });

  const supplierIds = spending.map((s) => s.supplierId);
  const suppliers = supplierIds.length
    ? await prisma.supplier.findMany({
        where: { id: { in: supplierIds } },
        select: { id: true, name: true },
      })
    : [];
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  const topN = Number(filter?.topN ?? 20);
  const supplierSpending = spending.slice(0, topN).map((s) => ({
    supplierId: s.supplierId,
    name: supplierMap.get(s.supplierId)?.name ?? "Unknown",
    totalSpentCents: toDecimal(s._sum.totalCents ?? 0),
    purchaseCount: s._count._all,
  }));

  const purchases = await prisma.purchase.findMany({
    where: purchaseWhere,
    select: { createdAt: true, receivedAt: true, totalCents: true },
    orderBy: [{ createdAt: "asc" }],
  });
  const dailyMap = new Map();
  for (const p of purchases) {
    const day = formatDayUTC(new Date(p.receivedAt ?? p.createdAt));
    const prev = dailyMap.get(day) ?? new Decimal(0);
    dailyMap.set(day, prev.add(toDecimal(p.totalCents ?? 0)));
  }
  const purchaseTrendDaily = Array.from(dailyMap.entries()).map(([day, v]) => ({
    day,
    totalCents: v,
  }));

  // Price changes (simple): last 20 purchase items for an inventory item.
  let priceHistory = [];
  if (filter?.inventoryItemId) {
    const itemRows = await prisma.purchaseItem.findMany({
      where: {
        inventoryItemId: filter.inventoryItemId,
        purchase: purchaseWhere,
      },
      select: {
        unitCostCents: true,
        createdAt: true,
        purchase: { select: { supplierId: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });

    priceHistory = itemRows.map((r) => ({
      day: formatDayUTC(new Date(r.createdAt)),
      unitCostCents: toDecimal(r.unitCostCents ?? 0),
      supplierId: r.purchase?.supplierId,
      supplierName: r.purchase?.supplierId
        ? supplierMap.get(r.purchase.supplierId)?.name
        : undefined,
    }));
  }

  return {
    supplierSpending,
    purchaseTrendDaily,
    priceHistory,
  };
}
