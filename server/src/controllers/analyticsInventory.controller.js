import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import {
  resolveBranchScope,
  resolveDateRange,
} from "../services/analytics/analyticsHelpers.js";
import {
  getInventoryForecast,
  generateInventoryForecastSnapshots as generateInventoryForecastSnapshotsService,
  getLowStockAlerts,
} from "../services/analytics/inventoryForecast.service.js";

export const inventoryForecast = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });

  const report = await getInventoryForecast({
    hotelId,
    branchId,
    query: req.query,
  });

  ok(res, "Inventory forecast", report);
});

export const generateInventoryForecastSnapshots = asyncHandler(
  async (req, res) => {
    const { hotelId, branchId: authBranchId } = req.auth;
    const branchId = resolveBranchScope({
      authBranchId,
      queryBranchId: req.query.branchId,
    });

    if (!branchId) {
      throw new ApiError(400, "INVALID_INPUT", "branchId is required");
    }

    const { from, to } = resolveDateRange({
      from: req.query.from,
      to: req.query.to,
    });
    const lookbackDays = Number(req.query.lookbackDays ?? 30);

    const result = await generateInventoryForecastSnapshotsService({
      hotelId,
      branchId,
      from,
      to,
      lookbackDays,
    });
    created(res, "Inventory forecast snapshots generated", result);
  },
);

export const lowStock = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.query.branchId,
  });
  const rows = await getLowStockAlerts({ hotelId, branchId });
  ok(res, "Low stock alerts", rows);
});
