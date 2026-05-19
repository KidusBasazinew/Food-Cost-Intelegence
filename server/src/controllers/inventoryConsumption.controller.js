import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import * as consumptionService from "../services/inventoryConsumptionEngine.service.js";

export const listConsumptions = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const rows = await consumptionService.listInventoryConsumptions({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Inventory consumptions", rows);
});

export const consumeRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId, sub: userId } = req.auth;
  const result = await consumptionService.consumeRecipeIngredients({
    hotelId,
    branchId,
    userId,
    recipeId: req.body.recipeId,
    servings: req.body.servings,
    sourceType: req.body.sourceType,
    sourceId: req.body.sourceId,
  });
  created(res, "Recipe consumed", result);
});

export const consumptionReport = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const report = await consumptionService.inventoryConsumptionReport({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Inventory consumption report", report);
});

export const usageVelocity = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const report = await consumptionService.usageVelocityReport({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Usage velocity", report);
});
