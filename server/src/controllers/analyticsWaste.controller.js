import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import { getWasteAnalytics } from "../services/analytics/wasteAnalytics.service.js";

export const wasteAnalytics = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });

  const data = await getWasteAnalytics({
    hotelId,
    branchId,
    from,
    to,
    filter: {
      inventoryItemId: req.query.inventoryItemId,
      topN: req.query.topN,
    },
  });

  ok(res, "Waste analytics", { range: { from, to }, ...data });
});
