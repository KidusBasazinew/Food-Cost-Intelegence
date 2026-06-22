import { Router } from "express";

import * as attendanceController from "../controllers/workforce.attendance.controller.js";
import * as employeesController from "../controllers/workforce.employees.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  pinSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesSchema,
  resetPinSchema,
  createScheduleSchema,
  updateScheduleSchema,
} from "../validations/workforce.validation.js";
import * as scheduleController from "../controllers/workforce.schedule.controller.js";
import * as reportsController from "../controllers/workforce.reports.controller.js";

export const workforceRouter = Router();

// Public PIN endpoint (kiosk/tablet will post hotelId+pin)
workforceRouter.post(
  "/attendance/pin",
  validate(pinSchema),
  attendanceController.pinAttendance,
);

// Protected workforce administration endpoints
workforceRouter.use(authMiddleware);

workforceRouter.get(
  "/employees",
  validate(listEmployeesSchema),
  employeesController.listEmployees,
);
workforceRouter.post(
  "/employees",
  validate(createEmployeeSchema),
  employeesController.createEmployee,
);
workforceRouter.get("/employees/:id", employeesController.getEmployee);
workforceRouter.patch(
  "/employees/:id",
  validate(updateEmployeeSchema),
  employeesController.updateEmployee,
);
workforceRouter.patch(
  "/employees/:id/disable",
  employeesController.disableEmployee,
);
workforceRouter.post(
  "/employees/:id/reset-pin",
  validate(resetPinSchema),
  employeesController.resetPin,
);

workforceRouter.get("/schedules", scheduleController.listSchedules);
workforceRouter.post(
  "/schedules",
  validate(createScheduleSchema),
  scheduleController.createSchedule,
);
workforceRouter.patch(
  "/schedules/:id",
  validate(updateScheduleSchema),
  scheduleController.updateSchedule,
);
workforceRouter.delete("/schedules/:id", scheduleController.deleteSchedule);

workforceRouter.get("/reports/summary", reportsController.employeeSummaries);

export default workforceRouter;
