import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import { getSupplierAnalytics } from "../services/analytics/supplierAnalytics.service.js";

export const supplierAnalytics = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const { from, to } = resolveDateRange({
    from: req.query.from,
    to: req.query.to,
  });

  const data = await getSupplierAnalytics({
    hotelId,
    branchId,
    from,
    to,
    filter: {
      supplierId: req.query.supplierId,
      inventoryItemId: req.query.inventoryItemId,
      topN: req.query.topN,
    },
  });

  ok(res, "Supplier analytics", { range: { from, to }, ...data });
});
