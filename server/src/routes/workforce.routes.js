import { Router } from "express";

import * as attendanceController from "../controllers/workforce.attendance.controller.js";
import * as employeesController from "../controllers/workforce.employees.controller.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { permissionMiddleware } from "../middlewares/permissionMiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  pinSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesSchema,
  resetPinSchema,
  createShiftSchema,
  updateShiftSchema,
} from "../validations/workforce.validation.js";
import * as shiftController from "../controllers/workforce.shift.controller.js";
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
  permissionMiddleware(PERMISSIONS.EMPLOYEES_VIEW),
  validate(listEmployeesSchema),
  employeesController.listEmployees,
);
workforceRouter.post(
  "/employees",
  permissionMiddleware(PERMISSIONS.EMPLOYEES_CREATE),
  validate(createEmployeeSchema),
  employeesController.createEmployee,
);
workforceRouter.get("/employees/:id", employeesController.getEmployee);
workforceRouter.patch(
  "/employees/:id",
  permissionMiddleware(PERMISSIONS.EMPLOYEES_UPDATE),
  validate(updateEmployeeSchema),
  employeesController.updateEmployee,
);
workforceRouter.patch(
  "/employees/:id/disable",
  permissionMiddleware(PERMISSIONS.EMPLOYEES_UPDATE),
  employeesController.disableEmployee,
);
workforceRouter.post(
  "/employees/:id/reset-pin",
  permissionMiddleware(PERMISSIONS.EMPLOYEES_UPDATE),
  validate(resetPinSchema),
  employeesController.resetPin,
);
workforceRouter.get(
  "/shifts",
  permissionMiddleware(PERMISSIONS.SHIFTS_VIEW),
  shiftController.listShifts,
);

workforceRouter.post(
  "/shifts",
  permissionMiddleware(PERMISSIONS.SHIFTS_CREATE),
  validate(createShiftSchema),
  shiftController.createShift,
);

workforceRouter.patch(
  "/shifts/:id",
  permissionMiddleware(PERMISSIONS.SHIFTS_UPDATE),
  validate(updateShiftSchema),
  shiftController.updateShift,
);

workforceRouter.delete(
  "/shifts/:id",
  permissionMiddleware(PERMISSIONS.SHIFTS_DELETE),
  shiftController.deleteShift,
);

workforceRouter.get(
  "/reports/summary",
  permissionMiddleware(PERMISSIONS.WORKFORCE_REPORTS_VIEW),
  reportsController.employeeSummaries,
);

export default workforceRouter;
