import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import * as shiftService from "../services/workforce.shift.service.js";

export const listShifts = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await shiftService.listShifts({
    hotelId,
  });
  ok(res, "Shifts", result);
});

export const createShift = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await shiftService.createShift({
    hotelId,
    input: req.body,
  });

  created(res, "Shift created", result);
});

export const updateShift = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await shiftService.updateShift({
    hotelId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Shift updated", result);
});

export const deleteShift = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  await shiftService.deleteShift({
    hotelId,
    id: req.params.id,
  });
  ok(res, "Shift deleted", {});
});
