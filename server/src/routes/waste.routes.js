import { Router } from "express";

import * as controller from "../controllers/waste.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  listWasteSchema,
  logWasteSchema,
  wasteReportSchema,
} from "../validations/waste.validation.js";

export const wasteRouter = Router();

wasteRouter.use(authMiddleware);

wasteRouter.get("/", validate(listWasteSchema), controller.listWaste);

wasteRouter.get("/report", validate(wasteReportSchema), controller.wasteReport);

wasteRouter.post(
  "/",
  permissionMiddleware(PERMISSIONS.WASTE_CREATE),
  validate(logWasteSchema),
  controller.logWaste,
);
