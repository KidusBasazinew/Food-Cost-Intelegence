import { Router } from "express";

import * as controller from "../controllers/analyticsWaste.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { wasteAnalyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsWasteRouter = Router();

analyticsWasteRouter.use(authMiddleware);

analyticsWasteRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(wasteAnalyticsQuerySchema),
  controller.wasteAnalytics,
);
