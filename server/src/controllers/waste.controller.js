import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import * as wasteService from "../services/wasteTracking.service.js";

export const logWaste = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await wasteService.logWaste({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });
  created(res, "Waste logged", result);
});

export const listWaste = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const rows = await wasteService.listWaste({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Waste", rows);
});

export const wasteReport = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const report = await wasteService.wasteReport({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Waste report", report);
});
