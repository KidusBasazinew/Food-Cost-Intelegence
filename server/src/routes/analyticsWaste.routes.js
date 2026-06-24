import { Router } from "express";

import * as controller from "../controllers/analyticsWaste.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { wasteAnalyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsWasteRouter = Router();

analyticsWasteRouter.use(authMiddleware);

analyticsWasteRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.WASTE_VIEW),
  validate(wasteAnalyticsQuerySchema),
  controller.wasteAnalytics,
);
