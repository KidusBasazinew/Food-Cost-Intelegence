import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
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
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_VIEW),
  validate(listStockCountsSchema),
  controller.listStockCounts,
);

stockCountsRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_CREATE),
  validate(createStockCountSchema),
  controller.createStockCount,
);

stockCountsRouter.get(
  "/:id",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_VIEW),
  validate(stockCountIdParamsSchema),
  controller.getStockCount,
);

stockCountsRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_UPDATE),
  validate(updateStockCountSchema),
  controller.updateStockCount,
);

stockCountsRouter.put(
  "/:id/items",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_UPDATE),
  validate(upsertStockCountItemSchema),
  controller.upsertItem,
);

stockCountsRouter.delete(
  "/:id/items/:itemId",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_DELETE),
  validate(stockCountItemParamsSchema),
  controller.deleteItem,
);

stockCountsRouter.post(
  "/:id/complete",
  permissionMiddleware(PERMISSIONS.STOCK_COUNTS_UPDATE),
  validate(completeStockCountSchema),
  controller.completeStockCount,
);
