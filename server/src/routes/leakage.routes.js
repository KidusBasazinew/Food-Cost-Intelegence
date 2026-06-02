import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import * as controller from "../controllers/leakage.controller.js";
import { leakageDashboardQuerySchema } from "../validations/leakage.validation.js";

export const leakageRouter = Router();

leakageRouter.use(authMiddleware);

leakageRouter.get(
  "/dashboard",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(leakageDashboardQuerySchema),
  controller.dashboard,
);
