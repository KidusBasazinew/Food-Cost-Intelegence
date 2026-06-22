import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export async function listSchedules({ hotelId }) {
  return prisma.workSchedule.findMany({
    where: { hotelId },
    orderBy: [{ createdAt: "asc" }],
  });
}

export async function createSchedule({ hotelId, input }) {
  return prisma.workSchedule.create({
    data: {
      hotelId,
      name: input.name,
      startTime: input.startTime,
      endTime: input.endTime,
      graceMinutes: input.graceMinutes ?? 10,
    },
  });
}

export async function updateSchedule({ hotelId, id, input }) {
  const schedule = await prisma.workSchedule.findFirst({
    where: { id, hotelId },
  });
  if (!schedule) throw new ApiError(404, "NOT_FOUND", "Schedule not found");

  return prisma.workSchedule.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      startTime: input.startTime ?? undefined,
      endTime: input.endTime ?? undefined,
      graceMinutes: input.graceMinutes ?? undefined,
    },
  });
}

export async function deleteSchedule({ hotelId, id }) {
  const schedule = await prisma.workSchedule.findFirst({
    where: { id, hotelId },
  });
  if (!schedule) throw new ApiError(404, "NOT_FOUND", "Schedule not found");

  await prisma.workSchedule.delete({ where: { id } });
}
