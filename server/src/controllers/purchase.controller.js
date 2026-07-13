import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import * as purchaseService from "../services/purchase.service.js";

export const list = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const purchases = await purchaseService.listPurchases({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Purchases", purchases);
});

export const getById = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const purchase = await purchaseService.getPurchaseById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Purchase", purchase);
});

export const create = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const purchase = await purchaseService.createPurchase({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });
  created(res, "Purchase created", purchase);
});

export const update = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const purchase = await purchaseService.updatePurchase({
    hotelId,
    branchId,
    userId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Purchase updated", purchase);
});
