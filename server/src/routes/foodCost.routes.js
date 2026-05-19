import { Router } from "express";

import * as controller from "../controllers/foodCost.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { foodCostReportSchema } from "../validations/foodCost.validation.js";

export const foodCostRouter = Router();

foodCostRouter.use(authMiddleware);

foodCostRouter.get(
  "/",
  validate(foodCostReportSchema),
  controller.foodCostReport,
);
