import { Router } from "express";

import * as controller from "../controllers/analyticsMenuEngineering.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  analyticsQuerySchema,
  menuEngineeringQuerySchema,
} from "../validations/analytics.validation.js";

export const analyticsMenuEngineeringRouter = Router();

analyticsMenuEngineeringRouter.use(authMiddleware);

analyticsMenuEngineeringRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(menuEngineeringQuerySchema),
  controller.menuEngineering,
);

analyticsMenuEngineeringRouter.post(
  "/snapshots",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(analyticsQuerySchema),
  controller.generateMenuSnapshots,
);
