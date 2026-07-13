import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as reportsService from "../services/workforce.reports.service.js";

export const employeeSummaries = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = req.query.branchId ?? authBranchId ?? null;
  const from = req.query.from
    ? new Date(req.query.from)
    : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to) : new Date();

  const data = await reportsService.getEmployeeAttendanceSummaries({
    hotelId,
    branchId,
    from,
    to,
  });
  ok(res, "Employee attendance summaries", data);
});
