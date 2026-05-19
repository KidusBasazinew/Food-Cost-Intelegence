import { Router } from "express";

import * as controller from "../controllers/analyticsSuppliers.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { supplierAnalyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsSuppliersRouter = Router();

analyticsSuppliersRouter.use(authMiddleware);

analyticsSuppliersRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(supplierAnalyticsQuerySchema),
  controller.supplierAnalytics,
);
