import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import { getLeakageDashboard } from "../services/analytics/leakageAnalytics.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;

  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });

  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
    defaultLookbackDays: 30,
  });

  const data = await getLeakageDashboard({
    hotelId,
    branchId,
    from,
    to,
    topN: req.query.topN,
  });

  ok(res, "Leakage dashboard", data);
});
