import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import * as employeeService from "../services/workforce.employees.service.js";

export const listEmployees = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await employeeService.listEmployees({
    hotelId,
    branchId,
    query: req.query,
  });
  ok(res, "Employees", result);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await employeeService.createEmployee({
    hotelId,
    branchId,
    input: req.body,
  });
  created(res, "Employee created", result);
});

export const getEmployee = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await employeeService.getEmployeeById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Employee", result);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await employeeService.updateEmployee({
    hotelId,
    branchId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Employee updated", result);
});

export const disableEmployee = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  await employeeService.disableEmployee({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Employee disabled", {});
});

export const resetPin = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const result = await employeeService.resetPin({
    hotelId,
    branchId,
    id: req.params.id,
    newPin: req.body.newPin,
  });
  ok(res, "PIN reset", result);
});
