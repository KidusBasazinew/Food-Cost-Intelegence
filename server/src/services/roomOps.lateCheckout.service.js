import { prisma } from "../prisma/client.js";
import * as reservationService from "./roomOps.reservation.service.js";
import * as notificationService from "./notification.service.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

// Detect overdue checkouts, apply fees, create notifications, and return list
export const detectAndProcessLateCheckouts = async ({ hotelId } = {}) => {
  const now = new Date();
  const where = {
    status: "CHECKED_IN",
    checkOutAt: { lt: now },
    ...(hotelId ? { hotelId } : {}),
  };

  const overdue = await prisma.reservation.findMany({
    where,
    include: { room: true },
  });

  const feePerHourCents = parseInt(
    process.env.LATE_CHECKOUT_FEE_PER_HOUR_CENTS || "1000",
    10,
  );

  const results = [];

  for (const r of overdue) {
    // compute hours overdue
    const msOver = now.getTime() - new Date(r.checkOutAt).getTime();
    const hours = Math.ceil(msOver / (1000 * 60 * 60));
    const fee = Math.max(0, hours * feePerHourCents);

    await reservationService.applyLateCheckoutFee(r.id, fee);

    await notificationService.createNotificationIfNotExists({
      data: {
        hotelId: r.hotelId,
        branchId: r.branchId ?? null,
        type: "SYSTEM_ALERT",
        severity: "WARNING",
        title: `Late checkout detected for room ${r.roomId}`,
        message: `Guest stayed ${hours} hour(s) late — fee ${fee} cents applied.`,
        actionUrl: `/ops/reservations/${r.id}`,
      },
    });

    logger.info("late_checkout.processed", { reservationId: r.id, fee });
    results.push({ reservationId: r.id, fee });
  }

  return results;
};
