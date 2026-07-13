import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as attendanceService from "../services/workforce.attendance.service.js";

export const pinAttendance = asyncHandler(async (req, res) => {
  const { pin, hotelId, branchId } = req.body;
  const actor = req.auth?.sub ?? null;
  const result = await attendanceService.handlePin({
    pin,
    hotelId,
    branchId,
    actor,
  });
  ok(res, result.message, result.data);
});
