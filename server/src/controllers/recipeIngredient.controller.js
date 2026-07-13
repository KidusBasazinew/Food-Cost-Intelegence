import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import * as recipeService from "../services/recipe.service.js";

export const listIngredients = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const ingredients = await recipeService.listRecipeIngredients({
    hotelId,
    branchId,
    recipeId: req.query.recipeId,
  });
  ok(res, "Recipe ingredients", ingredients);
});

export const addIngredient = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.addRecipeIngredient({
    hotelId,
    branchId,
    recipeId: req.body.recipeId,
    input: req.body,
  });
  created(res, "Ingredient added", recipe);
});

export const updateIngredient = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.updateRecipeIngredient({
    hotelId,
    branchId,
    ingredientId: req.params.id,
    input: req.body,
  });
  ok(res, "Ingredient updated", recipe);
});

export const deleteIngredient = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const recipe = await recipeService.deleteRecipeIngredient({
    hotelId,
    branchId,
    ingredientId: req.params.id,
  });
  ok(res, "Ingredient removed", recipe);
});
