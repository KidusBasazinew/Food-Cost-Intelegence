import { Router } from "express";

import * as controller from "../controllers/analyticsAttendance.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { analyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsAttendanceRouter = Router();

analyticsAttendanceRouter.use(authMiddleware);

analyticsAttendanceRouter.get(
  "/",
  permissionMiddleware(PERMISSIONS.WORKFORCE_REPORTS_VIEW),
  validate(analyticsQuerySchema),
  controller.attendanceOverview,
);
