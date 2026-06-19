import { asyncHandler } from "../utils/asyncHandler.js";
import * as housekeepingService from "../services/roomOps.housekeeping.service.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { createHousekeepingValidation } from "../validations/roomOps.housekeeping.validation.js";
import { ok, created } from "../utils/apiResponse.js";

export const createTask = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const { roomId, reservationId, kind, notes } = req.body;
  const { valid, errors } = createHousekeepingValidation(req.body);
  if (!valid) return res.status(400).json({ errors });
  const task = await housekeepingService.createHousekeepingTask({
    hotelId,
    branchId,
    roomId,
    reservationId,
    kind,
    notes,
  });
  return created(res, "Housekeeping task created", task);
});

export const listTasks = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const tasks = await housekeepingService.getAllHousekeepingTasks({
    hotelId,
    status: req.query.status,
  });
  return ok(res, "Housekeeping tasks", tasks);
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.getHousekeepingTaskById(req.params.id);
  return ok(res, "Housekeeping task", task);
});

export const startTask = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  const task = await housekeepingService.assignAndStartTask(
    req.params.id,
    userId,
  );
  return ok(res, "Housekeeping task started", task);
});

export const completeTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.completeTask(req.params.id);
  return ok(res, "Housekeeping task completed", task);
});

export const verifyTask = asyncHandler(async (req, res) => {
  const verifierId = req.auth.sub;
  const task = await housekeepingService.verifyTask(req.params.id, verifierId);
  return ok(res, "Housekeeping task verified", task);
});
