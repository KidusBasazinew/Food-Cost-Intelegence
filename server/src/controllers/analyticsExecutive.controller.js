import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import { getExecutiveDashboard } from "../services/analytics/executiveDashboard.service.js";

export const executiveDashboard = asyncHandler(async (req, res) => {
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

  try {
    const data = await getExecutiveDashboard({
      hotelId,
      branchId,
      from,
      to,
      filter: {
        supplierId: req.query.supplierId,
        inventoryItemId: req.query.inventoryItemId,
        menuCategory: req.query.menuCategory,
        topN: req.query.topN,
        lookbackDays: 30,
      },
    });
    ok(res, "Executive dashboard", data);
  } catch (e) {
    throw new ApiError(400, "INVALID_INPUT", e?.message || "Invalid request");
  }
});
