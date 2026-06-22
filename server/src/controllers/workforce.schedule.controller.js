import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import * as scheduleService from "../services/workforce.schedule.service.js";

export const listSchedules = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await scheduleService.listSchedules({ hotelId });
  ok(res, "Work schedules", result);
});

export const createSchedule = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await scheduleService.createSchedule({
    hotelId,
    input: req.body,
  });
  created(res, "Schedule created", result);
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  const result = await scheduleService.updateSchedule({
    hotelId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Schedule updated", result);
});

export const deleteSchedule = asyncHandler(async (req, res) => {
  const { hotelId } = req.auth;
  await scheduleService.deleteSchedule({ hotelId, id: req.params.id });
  ok(res, "Schedule deleted", {});
});
