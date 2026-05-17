import { Router } from "express";

import * as supplierController from "../controllers/supplier.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(createSupplierSchema),
  supplierController.create,
);

supplierRouter.patch(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateSupplierSchema),
  supplierController.update,
);

supplierRouter.delete(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(supplierParamsSchema),
  supplierController.remove,
);
