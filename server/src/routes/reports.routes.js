import { Router } from "express";

import * as controller from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  listReportsSchema,
  reportExportSchema,
} from "../validations/reports.validation.js";

export const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.REPORTS_VIEW),
  validate(listReportsSchema),
  controller.listReports,
);

reportsRouter.get(
  "/export",
  permissionMiddleware(PERMISSIONS.REPORTS_VIEW),
  validate(reportExportSchema),
  controller.exportReport,
);
