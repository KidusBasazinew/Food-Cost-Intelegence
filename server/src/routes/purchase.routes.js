import { Router } from "express";

import * as purchaseController from "../controllers/purchase.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createPurchaseSchema,
  listPurchasesSchema,
  purchaseParamsSchema,
  updatePurchaseSchema,
} from "../validations/purchase.validation.js";

export const purchaseRouter = Router();

purchaseRouter.use(authMiddleware);

purchaseRouter.get("/", validate(listPurchasesSchema), purchaseController.list);

purchaseRouter.get(
  "/:id",
  validate(purchaseParamsSchema),
  purchaseController.getById,
);

purchaseRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.PURCHASES_CREATE),
  validate(createPurchaseSchema),
  purchaseController.create,
);

purchaseRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.PURCHASES_UPDATE),
  validate(updatePurchaseSchema),
  purchaseController.update,
);
