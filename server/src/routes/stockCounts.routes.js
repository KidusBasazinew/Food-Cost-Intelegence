import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import * as controller from "../controllers/stockCount.controller.js";
import {
  completeStockCountSchema,
  createStockCountSchema,
  listStockCountsSchema,
  stockCountIdParamsSchema,
  stockCountItemParamsSchema,
  updateStockCountSchema,
  upsertStockCountItemSchema,
} from "../validations/stockCount.validation.js";

export const stockCountsRouter = Router();

stockCountsRouter.use(authMiddleware);

stockCountsRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(listStockCountsSchema),
  controller.listStockCounts,
);

stockCountsRouter.post(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(createStockCountSchema),
  controller.createStockCount,
);

stockCountsRouter.get(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(stockCountIdParamsSchema),
  controller.getStockCount,
);

stockCountsRouter.patch(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateStockCountSchema),
  controller.updateStockCount,
);

stockCountsRouter.put(
  "/:id/items",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(upsertStockCountItemSchema),
  controller.upsertItem,
);

stockCountsRouter.delete(
  "/:id/items/:itemId",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(stockCountItemParamsSchema),
  controller.deleteItem,
);

stockCountsRouter.post(
  "/:id/complete",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(completeStockCountSchema),
  controller.completeStockCount,
);
