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
import { notificationsRouter } from "./notifications.routes.js";
import { analyticsExecutiveRouter } from "./analyticsExecutive.routes.js";
import { analyticsFoodCostRouter } from "./analyticsFoodCost.routes.js";
import { analyticsMenuEngineeringRouter } from "./analyticsMenuEngineering.routes.js";
import { analyticsWasteRouter } from "./analyticsWaste.routes.js";
import { analyticsInventoryRouter } from "./analyticsInventory.routes.js";
import { analyticsSuppliersRouter } from "./analyticsSuppliers.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { posRouter } from "./pos.routes.js";
// import { auditsRouter } from "./audits.routes.js";
// import { varianceRouter } from "./variance.routes.js";
// import { leakageRouter } from "./leakage.routes.js";
// import { reconciliationRouter } from "./reconciliation.routes.js";

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

// Stage 6 — Enterprise Notifications
apiRouter.use("/notifications", notificationsRouter);

// Stage 5 — Executive Food Operations BI
apiRouter.use("/analytics/executive", analyticsExecutiveRouter);
apiRouter.use("/analytics/food-cost", analyticsFoodCostRouter);
apiRouter.use("/analytics/menu-engineering", analyticsMenuEngineeringRouter);
apiRouter.use("/analytics/waste", analyticsWasteRouter);
apiRouter.use("/analytics/inventory", analyticsInventoryRouter);
apiRouter.use("/analytics/suppliers", analyticsSuppliersRouter);
apiRouter.use("/reports", reportsRouter);

// Stage 7 — POS Orders + Kitchen
apiRouter.use("/pos", posRouter);

// Stage 6 — Inventory Audits + Variance/Leakage + Reconciliation
// apiRouter.use("/audits", auditsRouter);
// apiRouter.use("/variance", varianceRouter);
// apiRouter.use("/leakage", leakageRouter);
// apiRouter.use("/reconciliation", reconciliationRouter);
