import { Router } from "express";

import * as recipeController from "../controllers/recipe.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateRecipeSchema),
  recipeController.updateRecipe,
);

recipesRouter.post(
  "/:id/recalculate-cost",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(recipeParamsSchema),
  recipeController.recalcRecipe,
);

recipesRouter.delete(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(recipeParamsSchema),
  recipeController.deleteRecipe,
);
