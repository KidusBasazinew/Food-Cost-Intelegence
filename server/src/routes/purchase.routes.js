import { Router } from "express";

import * as purchaseController from "../controllers/purchase.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(createPurchaseSchema),
  purchaseController.create,
);

purchaseRouter.patch(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updatePurchaseSchema),
  purchaseController.update,
);
