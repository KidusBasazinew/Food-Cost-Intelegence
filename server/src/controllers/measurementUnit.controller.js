import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import * as measurementUnitService from "../services/measurementUnit.service.js";

export const list = asyncHandler(async (_req, res) => {
  const units = await measurementUnitService.listMeasurementUnits();
  ok(res, "Measurement units", units);
});

export const getById = asyncHandler(async (req, res) => {
  const unit = await measurementUnitService.getMeasurementUnitById(
    req.params.id,
  );
  ok(res, "Measurement unit", unit);
});

export const create = asyncHandler(async (req, res) => {
  const unit = await measurementUnitService.createMeasurementUnit(req.body);
  created(res, "Measurement unit created", unit);
});

export const update = asyncHandler(async (req, res) => {
  const unit = await measurementUnitService.updateMeasurementUnit(
    req.params.id,
    req.body,
  );
  ok(res, "Measurement unit updated", unit);
});

export const remove = asyncHandler(async (req, res) => {
  await measurementUnitService.deleteMeasurementUnit(req.params.id);
  noContent(res);
});
