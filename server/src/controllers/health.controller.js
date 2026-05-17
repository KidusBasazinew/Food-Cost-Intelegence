import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { getSystemHealth } from "../services/health.service.js";

export const getHealth = asyncHandler(async (_req, res) => {
  const data = await getSystemHealth();
  ok(res, "Health", data);
});
