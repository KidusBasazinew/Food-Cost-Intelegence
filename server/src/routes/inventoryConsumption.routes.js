import { Router } from "express";

import * as controller from "../controllers/inventoryConsumption.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  consumeRecipeSchema,
  consumptionReportSchema,
  listConsumptionsSchema,
  usageVelocitySchema,
} from "../validations/inventoryConsumption.validation.js";

export const inventoryConsumptionRouter = Router();

inventoryConsumptionRouter.use(authMiddleware);

inventoryConsumptionRouter.get(
  "/",
  validate(listConsumptionsSchema),
  controller.listConsumptions,
);

inventoryConsumptionRouter.get(
  "/report",
  validate(consumptionReportSchema),
  controller.consumptionReport,
);

inventoryConsumptionRouter.get(
  "/velocity",
  validate(usageVelocitySchema),
  controller.usageVelocity,
);

inventoryConsumptionRouter.post(
  "/consume-recipe",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(consumeRecipeSchema),
  controller.consumeRecipe,
);
