import { Router } from "express";

import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { measurementUnitRouter } from "./measurementUnit.routes.js";
import { inventoryRouter } from "./inventory.routes.js";
import { supplierRouter } from "./supplier.routes.js";
import { purchaseRouter } from "./purchase.routes.js";
import { recipesRouter } from "./recipes.routes.js";
import { recipeIngredientsRouter } from "./recipeIngredients.routes.js";
import { inventoryConsumptionRouter } from "./inventoryConsumption.routes.js";
import { foodCostRouter } from "./foodCost.routes.js";
import { wasteRouter } from "./waste.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/measurement-units", measurementUnitRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/suppliers", supplierRouter);
apiRouter.use("/purchases", purchaseRouter);
apiRouter.use("/recipes", recipesRouter);
apiRouter.use("/recipe-ingredients", recipeIngredientsRouter);
apiRouter.use("/inventory-consumption", inventoryConsumptionRouter);
apiRouter.use("/food-cost", foodCostRouter);
apiRouter.use("/waste", wasteRouter);
