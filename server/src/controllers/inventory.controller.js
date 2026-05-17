import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import * as inventoryService from "../services/inventory.service.js";

export const listItems = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const items = await inventoryService.listInventoryItems({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Inventory items", items);
});

export const getItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const item = await inventoryService.getInventoryItemById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Inventory item", item);
});

export const createItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const item = await inventoryService.createInventoryItem({
    hotelId,
    branchId,
    input: req.body,
  });
  created(res, "Inventory item created", item);
});

export const updateItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const item = await inventoryService.updateInventoryItem({
    hotelId,
    branchId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Inventory item updated", item);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  await inventoryService.deleteInventoryItem({
    hotelId,
    branchId,
    id: req.params.id,
  });
  noContent(res);
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const txns = await inventoryService.listInventoryTransactions({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Inventory transactions", txns);
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await inventoryService.createManualInventoryTransaction({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });
  created(res, "Inventory transaction created", result);
});
