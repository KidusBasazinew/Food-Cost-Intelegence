import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";

function pickClient(tx) {
  return tx ?? prisma;
}

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function listNotifications({
  tx,
  hotelId,
  branchId,
  userId,
  query,
}) {
  const client = pickClient(tx);

  const limitRaw = query?.limit ?? env.NOTIFICATION_PAGE_LIMIT;
  const limit = Math.max(1, Math.min(Number(limitRaw) || 20, 50));

  const cursor = query?.cursor ? String(query.cursor) : null;
  const unreadOnly = query?.unreadOnly === true;

  const where = {
    ...withBranchScope({ hotelId, branchId }),
    OR: [{ userId }, { userId: null }],
    ...(unreadOnly ? { isRead: false } : {}),
    ...(query?.type ? { type: query.type } : {}),
    ...(query?.severity ? { severity: query.severity } : {}),
    ...(query?.since
      ? {
          createdAt: {
            gte: new Date(query.since),
          },
        }
      : {}),
  };

  const items = await client.notification.findMany({
    where,
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const hasNext = items.length > limit;
  const pageItems = hasNext ? items.slice(0, limit) : items;
  const nextCursor = hasNext ? pageItems[pageItems.length - 1]?.id : null;

  return {
    items: pageItems,
    nextCursor,
  };
}

export async function countUnreadNotifications({
  tx,
  hotelId,
  branchId,
  userId,
  query,
}) {
  const client = pickClient(tx);

  const where = {
    ...withBranchScope({ hotelId, branchId }),
    isRead: false,
    OR: [{ userId }, { userId: null }],
    ...(query?.severity ? { severity: query.severity } : {}),
    ...(query?.type ? { type: query.type } : {}),
  };

  const count = await client.notification.count({ where });

  // Extra signal for UI (critical/high counts drive animation/badges).
  const criticalCount = await client.notification.count({
    where: {
      ...where,
      severity: "CRITICAL",
    },
  });

  const highCount = await client.notification.count({
    where: {
      ...where,
      severity: "HIGH",
    },
  });

  return {
    count,
    criticalCount,
    highCount,
  };
}
