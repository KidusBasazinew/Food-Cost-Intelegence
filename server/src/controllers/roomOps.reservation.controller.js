import { asyncHandler } from "../utils/asyncHandler.js";
import * as reservationService from "../services/roomOps.reservation.service.js";
import { createReservationValidation } from "../validations/roomOps.reservation.validation.js";
import { ApiError } from "../utils/apiError.js";
import { created, ok } from "../utils/apiResponse.js";

export const createReservation = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const input = { ...req.body, hotelId, branchId };
  const { valid, errors } = createReservationValidation(input);
  if (!valid) return res.status(400).json({ errors });
  const reservation = await reservationService.createReservation(input);
  return created(res, "Reservation created", reservation);
});

export const listReservations = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const filters = { hotelId, status: req.query.status };
  const rows = await reservationService.listReservations(filters);
  return ok(res, "Reservations", rows);
});

export const getReservation = asyncHandler(async (req, res) => {
  const data = await reservationService.getReservationById(req.params.id);
  if (!data) throw new ApiError(404, "NOT_FOUND", "Reservation not found");
  return ok(res, "Reservation", data);
});

export const checkIn = asyncHandler(async (req, res) => {
  const updated = await reservationService.checkInReservation(req.params.id);
  return ok(res, "Reservation checked in", updated);
});

export const checkOut = asyncHandler(async (req, res) => {
  const result = await reservationService.checkOutReservation(req.params.id);
  return ok(res, "Reservation checked out", result);
});
