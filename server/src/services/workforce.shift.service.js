import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export async function listShifts({ hotelId }) {
  return prisma.shift.findMany({
    where: {
      hotelId,
    },
    include: {
      employees: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });
}

export async function createShift({ hotelId, input }) {
  return prisma.shift.create({
    data: {
      hotelId,
      name: input.name,
      startTime: input.startTime,
      endTime: input.endTime,
      graceMinutes: input.graceMinutes ?? 10,
      color: input.color ?? null,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateShift({ hotelId, id, input }) {
  const shift = await prisma.shift.findFirst({
    where: {
      id,
      hotelId,
    },
  });

  if (!shift) {
    throw new ApiError(404, "NOT_FOUND", "Shift not found");
  }
  return prisma.shift.update({
    where: {
      id,
    },
    data: {
      name: input.name ?? undefined,
      startTime: input.startTime ?? undefined,
      endTime: input.endTime ?? undefined,
      graceMinutes: input.graceMinutes ?? undefined,
      color: input.color === undefined ? undefined : input.color,
      isActive: input.isActive === undefined ? undefined : input.isActive,
    },
  });
}

export async function deleteShift({ hotelId, id }) {
  const shift = await prisma.shift.findFirst({
    where: {
      id,
      hotelId,
    },
  });
  if (!shift) {
    throw new ApiError(404, "NOT_FOUND", "Shift not found");
  }
  // optional safety:
  // don't delete shifts assigned to employees
  const assignedEmployees = await prisma.employee.count({
    where: {
      shiftId: id,
    },
  });
  if (assignedEmployees > 0) {
    throw new ApiError(
      400,
      "SHIFT_IN_USE",
      "Cannot delete shift assigned to employees",
    );
  }

  await prisma.shift.delete({
    where: {
      id,
    },
  });
}
