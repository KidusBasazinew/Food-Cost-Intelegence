import { Router } from "express";

import * as controller from "../controllers/inventoryConsumption.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
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
  permissionMiddleware(PERMISSIONS.INVENTORY_CONSUMPTION_CREATE),
  validate(consumeRecipeSchema),
  controller.consumeRecipe,
);
