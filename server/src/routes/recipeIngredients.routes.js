import { Router } from "express";

import * as controller from "../controllers/recipeIngredient.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  addRecipeIngredientSchema,
  listRecipeIngredientsSchema,
  recipeIngredientParamsSchema,
  updateRecipeIngredientSchema,
} from "../validations/recipeIngredient.validation.js";

export const recipeIngredientsRouter = Router();

recipeIngredientsRouter.use(authMiddleware);

recipeIngredientsRouter.get(
  "/",
  validate(listRecipeIngredientsSchema),
  controller.listIngredients,
);

recipeIngredientsRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.RECIPE_INGREDIENTS_CREATE),
  validate(addRecipeIngredientSchema),
  controller.addIngredient,
);

recipeIngredientsRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.RECIPE_INGREDIENTS_UPDATE),
  validate(updateRecipeIngredientSchema),
  controller.updateIngredient,
);

recipeIngredientsRouter.delete(
  "/:id",
  permissionMiddleware(PERMISSIONS.RECIPE_INGREDIENTS_DELETE),
  validate(recipeIngredientParamsSchema),
  controller.deleteIngredient,
);
