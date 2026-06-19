import { Router } from "express";

import * as controller from "../controllers/analyticsAttendance.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { analyticsQuerySchema } from "../validations/analytics.validation.js";

export const analyticsAttendanceRouter = Router();

analyticsAttendanceRouter.use(authMiddleware);

analyticsAttendanceRouter.get(
  "/",
  roleMiddleware(["SUPER_ADMIN", "ADMIN", "MANAGER"]),
  validate(analyticsQuerySchema),
  controller.attendanceOverview,
);
