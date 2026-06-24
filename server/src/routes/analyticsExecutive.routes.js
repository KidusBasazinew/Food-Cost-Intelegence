import { Router } from "express";

import * as controller from "../controllers/analyticsExecutive.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { executiveDashboardQuerySchema } from "../validations/analytics.validation.js";

export const analyticsExecutiveRouter = Router();

analyticsExecutiveRouter.use(authMiddleware);

analyticsExecutiveRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.ANALYTICS_VIEW),
  validate(executiveDashboardQuerySchema),
  controller.executiveDashboard,
);
