import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import { resolveBranchScope } from "../services/analytics/analyticsHelpers.js";
import * as stockCountService from "../services/stockCount.service.js";

export const createStockCount = asyncHandler(async (req, res) => {
  const { hotelId, branchId: authBranchId, sub: userId } = req.auth;
  const branchId = resolveBranchScope({
    authBranchId,
    queryBranchId: req.body.branchId,
  });

  const row = await stockCountService.createStockCount({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });

  created(res, "Stock count created", row);
});

export const listStockCounts = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await stockCountService.listStockCounts({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Stock counts", result);
});

export const getStockCount = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const row = await stockCountService.getStockCountById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Stock count", row);
});

export const updateStockCount = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const row = await stockCountService.updateStockCount({
    hotelId,
    branchId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Stock count updated", row);
});

export const upsertItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const row = await stockCountService.upsertStockCountItem({
    hotelId,
    branchId,
    stockCountId: req.params.id,
    inventoryItemId: req.body.inventoryItemId,
    physicalQuantity: req.body.physicalQuantity,
  });
  ok(res, "Stock count item saved", row);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  await stockCountService.deleteStockCountItem({
    hotelId,
    branchId,
    stockCountId: req.params.id,
    itemId: req.params.itemId,
  });
  noContent(res);
});

export const completeStockCount = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const row = await stockCountService.completeStockCount({
    hotelId,
    branchId,
    userId,
    id: req.params.id,
  });
  ok(res, "Stock count completed", row);
});
