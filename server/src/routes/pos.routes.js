import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import * as controller from "../controllers/pos.controller.js";
import {
  createPosOrderSchema,
  getPosOrderSchema,
  listKitchenSchema,
  listPosOrdersSchema,
  updatePosOrderSchema,
  updatePosOrderStatusSchema,
} from "../validations/pos.validation.js";

export const posRouter = Router();

posRouter.use(authMiddleware);

// Orders
posRouter.post(
  "/orders/draft",
  validate(createPosOrderSchema),
  controller.createDraftOrder,
);
posRouter.post(
  "/orders/send-to-kitchen",
  validate(createPosOrderSchema),
  controller.sendToKitchen,
);
posRouter.get("/orders", validate(listPosOrdersSchema), controller.listOrders);
posRouter.get("/orders/:id", validate(getPosOrderSchema), controller.getOrder);
posRouter.patch(
  "/orders/:id",
  validate(updatePosOrderSchema),
  controller.updateOrder,
);
posRouter.patch(
  "/orders/:id/status",
  validate(updatePosOrderStatusSchema),
  controller.updateStatus,
);

// Kitchen
posRouter.get("/kitchen", validate(listKitchenSchema), controller.listKitchen);

// Tables
posRouter.get("/tables", controller.listTables);

// Analytics
posRouter.get("/analytics/today", controller.todayAnalytics);
