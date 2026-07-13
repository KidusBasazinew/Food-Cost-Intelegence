import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import {
  getFoodCostKPIs,
  getInventoryValuation,
} from "../services/analytics/foodCostAnalytics.service.js";

export const foodCostAnalytics = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });

  const [kpis, valuation] = await Promise.all([
    getFoodCostKPIs({ hotelId, branchId, from, to }),
    getInventoryValuation({ hotelId, branchId }),
  ]);

  ok(res, "Food cost analytics", {
    range: { from, to },
    ...kpis,
    ...valuation,
  });
});
