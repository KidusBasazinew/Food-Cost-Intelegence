import { Router } from "express";

import * as measurementUnitController from "../controllers/measurementUnit.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import {
  createMeasurementUnitSchema,
  measurementUnitParamsSchema,
  updateMeasurementUnitSchema,
} from "../validations/measurementUnit.validation.js";

export const measurementUnitRouter = Router();

measurementUnitRouter.use(authMiddleware);

measurementUnitRouter.get("/", measurementUnitController.list);
measurementUnitRouter.get(
  "/:id",
  validate(measurementUnitParamsSchema),
  measurementUnitController.getById,
);

measurementUnitRouter.post(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(createMeasurementUnitSchema),
  measurementUnitController.create,
);

measurementUnitRouter.patch(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateMeasurementUnitSchema),
  measurementUnitController.update,
);

measurementUnitRouter.delete(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(measurementUnitParamsSchema),
  measurementUnitController.remove,
);
