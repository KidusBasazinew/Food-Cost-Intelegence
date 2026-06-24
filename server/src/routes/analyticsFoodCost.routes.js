import { Router } from "express";

import * as controller from "../controllers/analyticsFoodCost.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { analyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsFoodCostRouter = Router();

analyticsFoodCostRouter.use(authMiddleware);

analyticsFoodCostRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.FOOD_COST_VIEW),
  validate(analyticsQuerySchema),
  controller.foodCostAnalytics,
);
