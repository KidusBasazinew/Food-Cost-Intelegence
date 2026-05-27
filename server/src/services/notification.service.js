import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";

function pickClient(tx) {
  return tx ?? prisma;
}

export async function createNotification({ tx, data }) {
  const client = pickClient(tx);

  if (!data?.hotelId) throw new Error("Missing hotelId");
  if (!data?.type) throw new Error("Missing notification type");
  if (!data?.title) throw new Error("Missing notification title");

  return client.notification.create({
    data: {
      hotelId: data.hotelId,
      branchId: data.branchId ?? null,
      userId: data.userId ?? null,
      type: data.type,
      severity: data.severity ?? "INFO",
      title: data.title,
      message: data.message ?? null,
      actionUrl: data.actionUrl ?? null,
      metadata: data.metadata ?? undefined,
    },
  });
}

export async function createNotificationIfNotExists({ tx, dedupeKey, data }) {
  const client = pickClient(tx);

  // Keep dedupe intentionally simple and robust across DBs:
  // if a matching *unread* notification exists, do not create a new one.
  const dedupeActionUrl = dedupeKey ?? data.actionUrl ?? null;
  if (!dedupeActionUrl) return createNotification({ tx, data });

  const existing = await client.notification.findFirst({
    where: {
      hotelId: data.hotelId,
      branchId: data.branchId ?? null,
      userId: data.userId ?? null,
      type: data.type,
      isRead: false,
      actionUrl: dedupeActionUrl,
    },
    orderBy: [{ createdAt: "desc" }],
    select: { id: true },
  });

  if (existing) return null;

  return createNotification({ tx, data });
}

export async function markNotificationRead({ tx, hotelId, userId, id }) {
  const client = pickClient(tx);

  const notif = await client.notification.findFirst({
    where: {
      id,
      hotelId,
      OR: [{ userId }, { userId: null }],
    },
    select: { id: true, isRead: true },
  });

  if (!notif) throw new ApiError(404, "NOT_FOUND", "Notification not found");
  if (notif.isRead) return notif;

  return client.notification.update({
    where: { id: notif.id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    select: { id: true, isRead: true, readAt: true },
  });
}

export async function markAllNotificationsRead({
  tx,
  hotelId,
  branchId,
  userId,
}) {
  const client = pickClient(tx);

  // Only mark notifications targeted to the current user (and optional hotel-wide broadcasts).
  const result = await client.notification.updateMany({
    where: {
      hotelId,
      ...(branchId
        ? {
            OR: [{ branchId }, { branchId: null }],
          }
        : {}),
      isRead: false,
      OR: [{ userId }, { userId: null }],
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { updated: result.count };
}
