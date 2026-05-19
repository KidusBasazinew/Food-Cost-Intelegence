import { Router } from "express";

import * as controller from "../controllers/analyticsFoodCost.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { analyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsFoodCostRouter = Router();

analyticsFoodCostRouter.use(authMiddleware);

analyticsFoodCostRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(analyticsQuerySchema),
  controller.foodCostAnalytics,
);
