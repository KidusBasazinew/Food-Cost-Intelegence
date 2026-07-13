import { asyncHandler } from "../utils/asyncHandler.js";
import * as lateCheckoutService from "../services/roomOps.lateCheckout.service.js";
import { ok } from "../utils/apiResponse.js";

export const runLateCheckoutDetection = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await lateCheckoutService.detectAndProcessLateCheckouts({
    hotelId,
  });
  return ok(res, "Late checkouts processed", {
    processed: result.length,
    details: result,
  });
});

export const listLateCheckouts = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const rows = await lateCheckoutService.detectAndProcessLateCheckouts({
    hotelId,
  });
  return ok(res, "Late checkouts", rows);
});
