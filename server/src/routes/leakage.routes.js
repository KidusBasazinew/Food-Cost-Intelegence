import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import * as controller from "../controllers/leakage.controller.js";
import { leakageDashboardQuerySchema } from "../validations/leakage.validation.js";

export const leakageRouter = Router();

leakageRouter.use(authMiddleware);

leakageRouter.get(
  "/dashboard",
  permissionMiddleware(PERMISSIONS.LEAKAGE_VIEW),
  validate(leakageDashboardQuerySchema),
  controller.dashboard,
);
