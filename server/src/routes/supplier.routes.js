import { Router } from "express";

import * as supplierController from "../controllers/supplier.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createSupplierSchema,
  supplierParamsSchema,
  updateSupplierSchema,
} from "../validations/supplier.validation.js";

export const supplierRouter = Router();

supplierRouter.use(authMiddleware);

supplierRouter.get("/", supplierController.list);
supplierRouter.get(
  "/:id",
  validate(supplierParamsSchema),
  supplierController.getById,
);

supplierRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.SUPPLIERS_CREATE),
  validate(createSupplierSchema),
  supplierController.create,
);

supplierRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.SUPPLIERS_UPDATE),
  validate(updateSupplierSchema),
  supplierController.update,
);

supplierRouter.delete(
  "/:id",
  permissionMiddleware(PERMISSIONS.SUPPLIERS_DELETE),
  validate(supplierParamsSchema),
  supplierController.remove,
);
