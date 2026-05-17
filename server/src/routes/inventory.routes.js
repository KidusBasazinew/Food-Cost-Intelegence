import { Router } from "express";

import * as inventoryController from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateInventoryItemSchema),
  inventoryController.updateItem,
);

inventoryRouter.delete(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(inventoryItemParamsSchema),
  inventoryController.deleteItem,
);
