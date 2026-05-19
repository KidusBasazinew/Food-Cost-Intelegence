import { Router } from "express";

import * as controller from "../controllers/recipeIngredient.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
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
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(addRecipeIngredientSchema),
  controller.addIngredient,
);

recipeIngredientsRouter.patch(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(updateRecipeIngredientSchema),
  controller.updateIngredient,
);

recipeIngredientsRouter.delete(
  "/:id",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(recipeIngredientParamsSchema),
  controller.deleteIngredient,
);
