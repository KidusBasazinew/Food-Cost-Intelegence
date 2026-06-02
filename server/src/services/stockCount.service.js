import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import {
  HIGH_VARIANCE_PERCENT,
  MEDIUM_VARIANCE_PERCENT,
  classifyVariance,
} from "../constants/leakageThresholds.js";
import { createNotificationIfNotExists } from "./notification.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

async function listUsersByRoles({ tx, hotelId, branchId, roles }) {
  const client = tx ?? prisma;
  return client.user.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      status: "ACTIVE",
      role: { in: roles },
    },
    select: { id: true },
  });
}

async function notifyManagers({
  tx,
  hotelId,
  branchId,
  notification,
  dedupeKey,
}) {
  const users = await listUsersByRoles({
    tx,
    hotelId,
    branchId,
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  });

  const created = [];
  for (const u of users) {
    const n = await createNotificationIfNotExists({
      tx,
      dedupeKey,
      data: {
        hotelId,
        branchId: branchId ?? null,
        userId: u.id,
        ...notification,
      },
    });
    if (n) created.push(n);
  }

  return created;
}

function variancePercent({ varianceQty, systemQty }) {
  const sys = toDecimal(systemQty ?? 0);
  if (sys.eq(0)) return new Decimal(0);
  return toDecimal(varianceQty ?? 0)
    .div(sys)
    .mul(new Decimal(100));
}

function round1(dec) {
  return Number(toDecimal(dec ?? 0).toFixed(1));
}

export async function createStockCount({ hotelId, branchId, userId, input }) {
  const countedBy = input?.countedBy ?? userId ?? null;

  return prisma.stockCount.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      status: "DRAFT",
      countedBy,
      notes: input?.notes ?? null,
    },
    include: {
      items: {
        include: {
          inventoryItem: { select: { id: true, name: true, baseUnit: true } },
        },
      },
    },
  });
}

export async function listStockCounts({ hotelId, branchId, query }) {
  const page = Math.max(1, Number(query?.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(query?.limit ?? 20)));
  const skip = (page - 1) * limit;

  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.status ? { status: query.status } : {}),
    ...(query?.from || query?.to
      ? {
          createdAt: {
            ...(query?.from ? { gte: new Date(query.from) } : {}),
            ...(query?.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.stockCount.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        _count: { select: { items: true } },
      },
    }),
    prisma.stockCount.count({ where }),
  ]);

  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    rows,
  };
}

export async function getStockCountById({ hotelId, branchId, id }) {
  const row = await prisma.stockCount.findFirst({
    where: {
      id,
      ...withBranchScope({ hotelId, branchId }),
    },
    include: {
      items: {
        include: {
          inventoryItem: {
            select: {
              id: true,
              name: true,
              averageCostPerBaseUnitCents: true,
              baseUnit: true,
            },
          },
        },
        orderBy: [{ inventoryItem: { name: "asc" } }],
      },
    },
  });

  if (!row) throw new ApiError(404, "NOT_FOUND", "Stock count not found");
  return row;
}

export async function updateStockCount({ hotelId, branchId, id, input }) {
  const existing = await prisma.stockCount.findFirst({
    where: { id, ...withBranchScope({ hotelId, branchId }) },
    select: { id: true, status: true },
  });

  if (!existing) throw new ApiError(404, "NOT_FOUND", "Stock count not found");
  if (existing.status === "COMPLETED") {
    throw new ApiError(
      400,
      "LOCKED",
      "Completed stock counts cannot be edited",
    );
  }

  return prisma.stockCount.update({
    where: { id: existing.id },
    data: {
      countedBy: input?.countedBy === undefined ? undefined : input.countedBy,
      notes: input?.notes === undefined ? undefined : input.notes,
    },
    include: {
      items: {
        include: {
          inventoryItem: { select: { id: true, name: true, baseUnit: true } },
        },
      },
    },
  });
}

export async function upsertStockCountItem({
  hotelId,
  branchId,
  stockCountId,
  inventoryItemId,
  physicalQuantity,
}) {
  return prisma.$transaction(async (tx) => {
    const sc = await tx.stockCount.findFirst({
      where: { id: stockCountId, ...withBranchScope({ hotelId, branchId }) },
      select: { id: true, status: true },
    });

    if (!sc) throw new ApiError(404, "NOT_FOUND", "Stock count not found");
    if (sc.status === "COMPLETED") {
      throw new ApiError(
        400,
        "LOCKED",
        "Completed stock counts cannot be edited",
      );
    }

    const item = await tx.inventoryItem.findFirst({
      where: {
        id: inventoryItemId,
        ...withBranchScope({ hotelId, branchId }),
      },
      select: {
        id: true,
        quantityInStock: true,
      },
    });

    if (!item) {
      throw new ApiError(404, "NOT_FOUND", "Inventory item not found");
    }

    const systemQuantity = toDecimal(item.quantityInStock ?? 0);
    const physicalQty = toDecimal(physicalQuantity);

    const varianceQty = physicalQty.sub(systemQuantity);
    const variancePct = variancePercent({
      varianceQty,
      systemQty: systemQuantity,
    });

    const row = await tx.stockCountItem.upsert({
      where: {
        stockCountId_inventoryItemId: {
          stockCountId: sc.id,
          inventoryItemId: item.id,
        },
      },
      create: {
        stockCountId: sc.id,
        inventoryItemId: item.id,
        systemQuantity,
        physicalQuantity: physicalQty,
        varianceQuantity: varianceQty,
        variancePercentage: variancePct,
      },
      update: {
        // Update both quantities while still in DRAFT.
        systemQuantity,
        physicalQuantity: physicalQty,
        varianceQuantity: varianceQty,
        variancePercentage: variancePct,
      },
      include: {
        inventoryItem: { select: { id: true, name: true, baseUnit: true } },
      },
    });

    return row;
  });
}

export async function deleteStockCountItem({
  hotelId,
  branchId,
  stockCountId,
  itemId,
}) {
  return prisma.$transaction(async (tx) => {
    const sc = await tx.stockCount.findFirst({
      where: { id: stockCountId, ...withBranchScope({ hotelId, branchId }) },
      select: { id: true, status: true },
    });

    if (!sc) throw new ApiError(404, "NOT_FOUND", "Stock count not found");
    if (sc.status === "COMPLETED") {
      throw new ApiError(
        400,
        "LOCKED",
        "Completed stock counts cannot be edited",
      );
    }

    await tx.stockCountItem.delete({
      where: {
        id: itemId,
      },
    });

    return { deleted: true };
  });
}

export async function completeStockCount({ hotelId, branchId, userId, id }) {
  return prisma.$transaction(async (tx) => {
    const sc = await tx.stockCount.findFirst({
      where: { id, ...withBranchScope({ hotelId, branchId }) },
      include: {
        items: {
          select: {
            id: true,
            inventoryItemId: true,
            physicalQuantity: true,
          },
        },
      },
    });

    if (!sc) throw new ApiError(404, "NOT_FOUND", "Stock count not found");
    if (sc.status === "COMPLETED") return sc;

    if (!sc.items || sc.items.length === 0) {
      throw new ApiError(400, "EMPTY_COUNT", "Stock count has no items");
    }

    // Find last completed count to establish the cross-check window.
    const previous = await tx.stockCount.findFirst({
      where: {
        hotelId,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
        status: "COMPLETED",
        countedAt: { not: null },
        createdAt: { lt: sc.createdAt },
      },
      orderBy: [{ countedAt: "desc" }],
      select: { countedAt: true },
    });

    const countedAt = new Date();
    const windowFrom = previous?.countedAt
      ? new Date(previous.countedAt)
      : new Date(countedAt.getTime() - 30 * 24 * 60 * 60 * 1000);

    const inventoryItemIds = Array.from(
      new Set(sc.items.map((i) => i.inventoryItemId)),
    );

    // Expected consumption from POS orders for the same window.
    const expectedAgg = await tx.inventoryConsumption.groupBy({
      by: ["inventoryItemId"],
      where: {
        hotelId,
        ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
        sourceType: "ORDER",
        inventoryItemId: { in: inventoryItemIds },
        createdAt: { gte: windowFrom, lte: countedAt },
      },
      _sum: { quantityConsumedBaseUnit: true },
    });

    const expectedMap = new Map(
      expectedAgg.map((r) => [
        r.inventoryItemId,
        toDecimal(r._sum.quantityConsumedBaseUnit ?? 0),
      ]),
    );

    const items = await tx.inventoryItem.findMany({
      where: {
        id: { in: inventoryItemIds },
        ...withBranchScope({ hotelId, branchId }),
      },
      select: {
        id: true,
        name: true,
        quantityInStock: true,
        averageCostPerBaseUnitCents: true,
        baseUnit: { select: { symbol: true } },
      },
    });

    const itemMap = new Map(items.map((i) => [i.id, i]));

    const updates = [];
    const notificationsToSend = [];

    for (const sci of sc.items) {
      const inv = itemMap.get(sci.inventoryItemId);
      const systemQuantity = toDecimal(inv?.quantityInStock ?? 0);
      const physicalQty = toDecimal(sci.physicalQuantity ?? 0);
      const varianceQty = physicalQty.sub(systemQuantity);
      const variancePct = variancePercent({
        varianceQty,
        systemQty: systemQuantity,
      });

      updates.push(
        tx.stockCountItem.update({
          where: { id: sci.id },
          data: {
            systemQuantity,
            varianceQuantity: varianceQty,
            variancePercentage: variancePct,
          },
        }),
      );

      const absPct = variancePct.abs();

      if (absPct.gt(MEDIUM_VARIANCE_PERCENT)) {
        const severity = absPct.gte(HIGH_VARIANCE_PERCENT)
          ? "CRITICAL"
          : "WARNING";
        const itemName = inv?.name ?? "Inventory item";
        const pctLabel = `${round1(variancePct)}%`;

        notificationsToSend.push({
          type: "VARIANCE",
          inventoryItemId: sci.inventoryItemId,
          severity,
          title:
            severity === "CRITICAL"
              ? `CRITICAL STOCK LOSS: ${itemName} ${pctLabel}`
              : `${itemName} variance detected: ${pctLabel}`,
          message: varianceQty.lt(0)
            ? `Missing stock detected after physical count.`
            : `Excess stock detected after physical count.`,
          actionUrl: `/reports/leakage?stockCountId=${sc.id}&itemId=${sci.inventoryItemId}`,
          metadata: {
            stockCountId: sc.id,
            inventoryItemId: sci.inventoryItemId,
            varianceQuantity: varianceQty.toString(),
            variancePercentage: variancePct.toString(),
            classification: classifyVariance(absPct),
          },
        });

        // POS vs inventory cross-check for missing stock.
        const missing = varianceQty.lt(0) ? varianceQty.abs() : new Decimal(0);
        if (missing.gt(0)) {
          const expected =
            expectedMap.get(sci.inventoryItemId) ?? new Decimal(0);
          const unexplained = missing;

          // Simple, production-safe heuristic: alert if missing stock exceeds 20% of POS-expected usage.
          const threshold = expected.mul(new Decimal(0.2));
          if (expected.gt(0) && unexplained.gt(threshold)) {
            notificationsToSend.push({
              type: "CROSS_CHECK",
              inventoryItemId: sci.inventoryItemId,
              severity: "WARNING",
              title: `Possible over-portioning or theft detected: ${itemName}`,
              message: `Expected from POS: ${expected.toString()} ${inv?.baseUnit?.symbol || ""}. Missing in count: ${missing.toString()} ${inv?.baseUnit?.symbol || ""}.`,
              actionUrl: `/reports/leakage?stockCountId=${sc.id}&itemId=${sci.inventoryItemId}`,
              metadata: {
                stockCountId: sc.id,
                inventoryItemId: sci.inventoryItemId,
                expectedPosConsumptionBaseUnit: expected.toString(),
                missingVarianceBaseUnit: missing.toString(),
                windowFrom: windowFrom.toISOString(),
                windowTo: countedAt.toISOString(),
              },
            });
          }
        }
      }
    }

    await Promise.all(updates);

    const completed = await tx.stockCount.update({
      where: { id: sc.id },
      data: {
        status: "COMPLETED",
        countedAt,
        countedBy: sc.countedBy ?? userId ?? null,
      },
    });

    // Send notifications (deduped per user + actionUrl).
    for (const n of notificationsToSend) {
      await notifyManagers({
        tx,
        hotelId,
        branchId,
        dedupeKey: n.actionUrl,
        notification: {
          type: "WASTE_ALERT",
          severity: n.severity,
          title: n.title,
          message: n.message,
          actionUrl: n.actionUrl,
          metadata: n.metadata,
        },
      });
    }

    return completed;
  });
}
