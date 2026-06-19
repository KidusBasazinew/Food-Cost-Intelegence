import { prisma } from "../prisma/client.js";
import * as notificationService from "./notification.service.js";
import { logger } from "../config/logger.js";

export const createHousekeepingTask = async ({
  hotelId,
  branchId,
  roomId,
  reservationId,
  kind,
  notes,
}) => {
  const task = await prisma.housekeepingTask.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      roomId,
      reservationId: reservationId ?? null,
      kind,
      notes: notes ?? null,
    },
  });

  logger.info("housekeeping.task.created", { taskId: task.id, roomId });

  // Notify housekeeping team (hotel-wide) — dedupe by actionUrl pointing to task
  await notificationService.createNotificationIfNotExists({
    data: {
      hotelId,
      branchId: branchId ?? null,
      type: "SYSTEM_ALERT",
      severity: "INFO",
      title: `Housekeeping task created for room ${roomId}`,
      message: notes ?? null,
      actionUrl: `/ops/housekeeping/tasks/${task.id}`,
    },
  });

  return task;
};

export const getAllHousekeepingTasks = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.roomId) where.roomId = filters.roomId;
  if (filters.hotelId) where.hotelId = filters.hotelId;

  return await prisma.housekeepingTask.findMany({
    where,
    include: { room: true, reservation: true, assignedUser: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getHousekeepingTaskById = async (id) => {
  return await prisma.housekeepingTask.findUnique({
    where: { id },
    include: { room: true, reservation: true, assignedUser: true },
  });
};

export const assignAndStartTask = async (taskId, userId) => {
  // mark task in progress and assign user; set room status to CLEANING
  const task = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      assignedUserId: userId,
      checkedInAt: new Date(),
    },
    include: { room: true },
  });

  await prisma.room.update({
    where: { id: task.roomId },
    data: { status: "CLEANING" },
  });

  logger.info("housekeeping.task.started", { taskId, userId });
  return task;
};

export const completeTask = async (taskId) => {
  const task = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: { status: "CLEANED", completedAt: new Date() },
    include: { room: true },
  });

  // set room to INSPECTING so supervisor can verify
  await prisma.room.update({
    where: { id: task.roomId },
    data: { status: "INSPECTING" },
  });

  logger.info("housekeeping.task.completed", { taskId });
  return task;
};

export const verifyTask = async (taskId, verifierId) => {
  const task = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: { status: "VERIFIED", verifiedAt: new Date() },
    include: { room: true },
  });

  // mark room READY
  await prisma.room.update({
    where: { id: task.roomId },
    data: { status: "READY" },
  });

  logger.info("housekeeping.task.verified", { taskId, verifierId });

  // Notify room is ready
  await notificationService.createNotificationIfNotExists({
    data: {
      hotelId: task.hotelId,
      branchId: task.branchId ?? null,
      type: "SYSTEM_ALERT",
      severity: "SUCCESS",
      title: `Room ${task.roomId} is ready`,
      actionUrl: `/ops/rooms/${task.roomId}`,
    },
  });

  return task;
};
