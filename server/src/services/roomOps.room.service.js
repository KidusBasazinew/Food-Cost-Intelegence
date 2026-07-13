import { prisma } from "../prisma/client.js";

export const createRoom = async (data) => {
  console.log(data);
  return await prisma.room.create({ data });
};

export const getAllRooms = async (filters = {}) => {
  const where = { ...(filters.hotelId ? { hotelId: filters.hotelId } : {}) };
  if (filters.status) where.status = filters.status;

  return await prisma.room.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const getRoomById = async (id) => {
  return await prisma.room.findUnique({
    where: { id },
    include: { reservations: true, housekeepingTasks: true },
  });
};

export const updateRoom = async (id, data) => {
  return await prisma.room.update({ where: { id }, data });
};

export const deleteRoom = async (id) => {
  return await prisma.room.delete({ where: { id } });
};
