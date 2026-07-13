import { Router } from "express";

import * as inventoryController from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createInventoryItemSchema,
  createInventoryTransactionSchema,
  inventoryItemParamsSchema,
  listInventoryItemsSchema,
  listInventoryTransactionsSchema,
  updateInventoryItemSchema,
} from "../validations/inventory.validation.js";

export const inventoryRouter = Router();

inventoryRouter.use(authMiddleware);

inventoryRouter.get(
  "/",
  validate(listInventoryItemsSchema),
  inventoryController.listItems,
);
inventoryRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.INVENTORY_CREATE),
  validate(createInventoryItemSchema),
  inventoryController.createItem,
);

inventoryRouter.get(
  "/transactions",
  validate(listInventoryTransactionsSchema),
  inventoryController.listTransactions,
);

inventoryRouter.post(
  "/transactions",
  permissionMiddleware(PERMISSIONS.INVENTORY_TRANSACTIONS_CREATE),
  validate(createInventoryTransactionSchema),
  inventoryController.createTransaction,
);

inventoryRouter.get(
  "/:id",
  validate(inventoryItemParamsSchema),
  inventoryController.getItem,
);

inventoryRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.INVENTORY_UPDATE),
  validate(updateInventoryItemSchema),
  inventoryController.updateItem,
);

inventoryRouter.delete(
  "/:id",
  permissionMiddleware(PERMISSIONS.INVENTORY_DELETE),
  validate(inventoryItemParamsSchema),
  inventoryController.deleteItem,
);
