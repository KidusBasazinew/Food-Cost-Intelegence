import { Router } from "express";

import * as measurementUnitController from "../controllers/measurementUnit.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
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
  permissionMiddleware(PERMISSIONS.MEASUREMENT_UNITS_MANAGE),
  validate(createMeasurementUnitSchema),
  measurementUnitController.create,
);

measurementUnitRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.MEASUREMENT_UNITS_MANAGE),
  validate(updateMeasurementUnitSchema),
  measurementUnitController.update,
);

measurementUnitRouter.delete(
  "/:id",
  permissionMiddleware(PERMISSIONS.MEASUREMENT_UNITS_MANAGE),
  validate(measurementUnitParamsSchema),
  measurementUnitController.remove,
);
