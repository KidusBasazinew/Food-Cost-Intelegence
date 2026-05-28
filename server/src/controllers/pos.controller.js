import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import * as posService from "../modules/pos/services/posOrders.service.js";

export const createDraftOrder = asyncHandler(async (req, res) => {
  const { hotelId, branchId, userId } = req.auth;
  const order = await posService.createDraftPosOrder({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });
  created(res, "POS order draft created", order);
});

export const sendToKitchen = asyncHandler(async (req, res) => {
  const { hotelId, branchId, userId } = req.auth;
  const result = await posService.createAndSendPosOrder({
    hotelId,
    branchId,
    userId,
    input: req.body,
  });
  created(res, "POS order sent to kitchen", result);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { hotelId, branchId, userId } = req.auth;
  const result = await posService.updatePosOrderStatus({
    hotelId,
    branchId,
    userId,
    orderId: req.params.id,
    status: req.body.status,
  });
  ok(res, "POS order updated", result);
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { hotelId, branchId, userId } = req.auth;
  const result = await posService.updatePosOrder({
    hotelId,
    branchId,
    userId,
    orderId: req.params.id,
    input: req.body,
  });
  ok(res, "POS order edited", result);
});

export const listKitchen = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const rows = await posService.listKitchenQueue({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Kitchen queue", rows);
});

export const listOrders = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await posService.listPosOrders({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "POS orders", result);
});

export const getOrder = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await posService.getPosOrderById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "POS order", result);
});

export const listTables = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const rows = await posService.listPosTables({ hotelId, branchId });
  ok(res, "POS tables", rows);
});

export const todayAnalytics = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await posService.getPosTodayAnalytics({ hotelId, branchId });
  ok(res, "POS analytics", result);
});
