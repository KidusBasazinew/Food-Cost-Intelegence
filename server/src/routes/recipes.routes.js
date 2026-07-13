import { Router } from "express";

import * as recipeController from "../controllers/recipe.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createRecipeSchema,
  listRecipesSchema,
  recipeParamsSchema,
  updateRecipeSchema,
} from "../validations/recipe.validation.js";

export const recipesRouter = Router();

recipesRouter.use(authMiddleware);

recipesRouter.get(
  "/",
  validate(listRecipesSchema),
  recipeController.listRecipes,
);

recipesRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.RECIPES_CREATE),
  validate(createRecipeSchema),
  recipeController.createRecipe,
);

recipesRouter.get(
  "/:id",
  validate(recipeParamsSchema),
  recipeController.getRecipe,
);

recipesRouter.patch(
  "/:id",
  permissionMiddleware(PERMISSIONS.RECIPES_UPDATE),
  validate(updateRecipeSchema),
  recipeController.updateRecipe,
);

recipesRouter.post(
  "/:id/recalculate-cost",
  permissionMiddleware(PERMISSIONS.RECIPES_RECALCULATE),
  validate(recipeParamsSchema),
  recipeController.recalcRecipe,
);

recipesRouter.delete(
  "/:id",
  permissionMiddleware(PERMISSIONS.RECIPES_DELETE),
  validate(recipeParamsSchema),
  recipeController.deleteRecipe,
);
