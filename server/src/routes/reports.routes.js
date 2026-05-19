import { Router } from "express";

import * as controller from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  listReportsSchema,
  reportExportSchema,
} from "../validations/reports.validation.js";

export const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(listReportsSchema),
  controller.listReports,
);

reportsRouter.get(
  "/export",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(reportExportSchema),
  controller.exportReport,
);
