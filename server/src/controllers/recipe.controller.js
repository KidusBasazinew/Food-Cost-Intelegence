import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import * as recipeService from "../services/recipe.service.js";

export const listRecipes = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipes = await recipeService.listRecipes({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Recipes", recipes);
});

export const getRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.getRecipeById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Recipe", recipe);
});

export const createRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.createRecipe({
    hotelId,
    branchId,
    input: req.body,
  });
  created(res, "Recipe created", recipe);
});

export const updateRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.updateRecipe({
    hotelId,
    branchId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Recipe updated", recipe);
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  await recipeService.deleteRecipe({ hotelId, branchId, id: req.params.id });
  noContent(res);
});

export const recalcRecipe = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.recalcRecipe({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Recipe cost recalculated", recipe);
});
