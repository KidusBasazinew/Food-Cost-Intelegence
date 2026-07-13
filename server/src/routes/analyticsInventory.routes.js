import { Router } from "express";

import * as controller from "../controllers/analyticsInventory.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  analyticsQuerySchema,
  inventoryForecastQuerySchema,
} from "../validations/analytics.validation.js";

export const analyticsInventoryRouter = Router();

analyticsInventoryRouter.use(authMiddleware);

analyticsInventoryRouter.get(
  "/forecast",
  permissionMiddleware(PERMISSIONS.INVENTORY_VIEW),
  validate(inventoryForecastQuerySchema),
  controller.inventoryForecast,
);

analyticsInventoryRouter.post(
  "/forecast/snapshots",
  permissionMiddleware(PERMISSIONS.INVENTORY_VIEW),
  validate(analyticsQuerySchema),
  controller.generateInventoryForecastSnapshots,
);

analyticsInventoryRouter.get(
  "/low-stock",
  permissionMiddleware(PERMISSIONS.LOW_STOCK_VIEW),
  controller.lowStock,
);
