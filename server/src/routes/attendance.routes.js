import { Router } from "express";

import * as attendanceController from "../controllers/workforce.attendance.controller.js";
import { validate } from "../middlewares/validate.js";
import { pinSchema } from "../validations/workforce.validation.js";

export const attendanceRouter = Router();

// Spec alias: POST /api/attendance/pin
attendanceRouter.post(
  "/pin",
  validate(pinSchema),
  attendanceController.pinAttendance,
);
