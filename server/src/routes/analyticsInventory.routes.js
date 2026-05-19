import { Router } from "express";

import * as controller from "../controllers/analyticsInventory.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  analyticsQuerySchema,
  inventoryForecastQuerySchema,
} from "../validations/analytics.validation.js";

export const analyticsInventoryRouter = Router();

analyticsInventoryRouter.use(authMiddleware);

analyticsInventoryRouter.get(
  "/forecast",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(inventoryForecastQuerySchema),
  controller.inventoryForecast,
);

analyticsInventoryRouter.post(
  "/forecast/snapshots",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(analyticsQuerySchema),
  controller.generateInventoryForecastSnapshots,
);

analyticsInventoryRouter.get(
  "/low-stock",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  controller.lowStock,
);
