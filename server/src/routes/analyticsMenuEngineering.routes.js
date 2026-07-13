import { Router } from "express";

import * as controller from "../controllers/analyticsMenuEngineering.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  analyticsQuerySchema,
  menuEngineeringQuerySchema,
} from "../validations/analytics.validation.js";

export const analyticsMenuEngineeringRouter = Router();

analyticsMenuEngineeringRouter.use(authMiddleware);

analyticsMenuEngineeringRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.FOOD_COST_VIEW),
  validate(menuEngineeringQuerySchema),
  controller.menuEngineering,
);

analyticsMenuEngineeringRouter.post(
  "/snapshots",
  permissionMiddleware(PERMISSIONS.FOOD_COST_VIEW),
  validate(analyticsQuerySchema),
  controller.generateMenuSnapshots,
);
