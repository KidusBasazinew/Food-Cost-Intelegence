import { asyncHandler } from "../utils/asyncHandler.js";
import * as roomService from "../services/roomOps.room.service.js";
import { createRoomValidation } from "../validations/roomOps.room.validation.js";
import { created, ok } from "../utils/apiResponse.js";

export const createRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const payload = { ...req.body, hotelId };
  const { valid, errors } = createRoomValidation(payload);
  if (!valid) return res.status(400).json({ errors });
  const room = await roomService.createRoom(payload);
  return created(res, "Room created", room);
});

export const listRooms = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const rooms = await roomService.getAllRooms({
    hotelId,
    status: req.query.status,
  });
  return ok(res, "Rooms", rooms);
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  return ok(res, "Room", room);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  return ok(res, "Room updated", room);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id);
  return ok(res, "Room deleted", null);
});
