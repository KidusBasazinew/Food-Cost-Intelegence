import { prisma } from "../prisma/client.js";
import * as housekeepingService from "./roomOps.housekeeping.service.js";
import * as notificationService from "./notification.service.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const createReservation = async (data) => {
  return await prisma.reservation.create({ data });
};

export const listReservations = async (filters = {}) => {
  const where = {};
  if (filters.hotelId) where.hotelId = filters.hotelId;
  if (filters.status) where.status = filters.status;
  return await prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const getReservationById = async (id) => {
  return await prisma.reservation.findUnique({
    where: { id },
    include: { room: true, housekeepingTasks: true },
  });
};

export const checkInReservation = async (id) => {
  // mark reservation CHECKED_IN and set room to OCCUPIED
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: "CHECKED_IN", checkInAt: new Date() },
    include: { room: true },
  });

  await prisma.room.update({
    where: { id: reservation.roomId },
    data: { status: "OCCUPIED" },
  });

  logger.info("reservation.checked_in", { reservationId: id });

  return reservation;
};

export const checkOutReservation = async (id) => {
  // mark reservation CHECKED_OUT, set actualCheckOutAt, mark room DIRTY and create housekeeping task
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: "CHECKED_OUT", actualCheckOutAt: new Date() },
    include: { room: true },
  });

  await prisma.room.update({
    where: { id: reservation.roomId },
    data: { status: "DIRTY" },
  });

  // create housekeeping task
  const task = await housekeepingService.createHousekeepingTask({
    hotelId: reservation.hotelId,
    branchId: reservation.branchId,
    roomId: reservation.roomId,
    reservationId: reservation.id,
    kind: "CLEANING",
    notes: `Auto-created on checkout of reservation ${reservation.id}`,
  });

  logger.info("reservation.checked_out", {
    reservationId: id,
    housekeepingTaskId: task.id,
  });

  // Notify housekeeping
  await notificationService.createNotificationIfNotExists({
    data: {
      hotelId: reservation.hotelId,
      branchId: reservation.branchId ?? null,
      type: "SYSTEM_ALERT",
      severity: "INFO",
      title: `Room ${reservation.roomId} requires cleaning`,
      actionUrl: `/ops/housekeeping/tasks/${task.id}`,
    },
  });

  return { reservation, task };
};

export const applyLateCheckoutFee = async (id, feeCents) => {
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { lateCheckoutFeeCents: feeCents },
  });
  logger.info("reservation.late_fee_applied", { reservationId: id, feeCents });
  return reservation;
};

export const listLateCheckouts = async (hotelId) => {
  // find all reservations still CHECKED_IN with checkOutAt < now
  const now = new Date();
  const where = {
    status: "CHECKED_IN",
    checkOutAt: { lt: now },
    ...(hotelId ? { hotelId } : {}),
  };

  return await prisma.reservation.findMany({ where, include: { room: true } });
};
