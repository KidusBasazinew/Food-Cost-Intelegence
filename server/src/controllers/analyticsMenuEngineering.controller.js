import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import {
  getMenuEngineering,
  generateMenuAnalyticsSnapshots,
} from "../services/analytics/menuEngineering.service.js";

export const menuEngineering = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });

  const report = await getMenuEngineering({
    hotelId,
    branchId,
    from,
    to,
    filter: {
      menuCategory: req.query.menuCategory,
      recipeId: req.query.recipeId,
      topN: req.query.topN,
    },
  });

  ok(res, "Menu engineering", { range: { from, to }, ...report });
});

export const generateMenuSnapshots = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });
  const period = req.query.period ?? "DAILY";
  const snapshotDate = to;

  if (!branchId) {
    throw new ApiError(400, "INVALID_INPUT", "branchId is required");
  }

  const result = await generateMenuAnalyticsSnapshots({
    hotelId,
    branchId,
    from,
    to,
    period,
    snapshotDate,
  });
  created(res, "Menu snapshots generated", result);
});
