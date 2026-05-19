import { Router } from "express";

import * as controller from "../controllers/analyticsExecutive.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { executiveDashboardQuerySchema } from "../validations/analytics.validation.js";

export const analyticsExecutiveRouter = Router();

analyticsExecutiveRouter.use(authMiddleware);

analyticsExecutiveRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(executiveDashboardQuerySchema),
  controller.executiveDashboard,
);
