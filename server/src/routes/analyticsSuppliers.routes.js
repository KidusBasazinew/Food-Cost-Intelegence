import { Router } from "express";

import * as controller from "../controllers/analyticsSuppliers.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { supplierAnalyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsSuppliersRouter = Router();

analyticsSuppliersRouter.use(authMiddleware);

analyticsSuppliersRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.SUPPLIERS_VIEW),
  validate(supplierAnalyticsQuerySchema),
  controller.supplierAnalytics,
);
