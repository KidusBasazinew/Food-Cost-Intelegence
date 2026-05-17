import { asyncHandler } from "../utils/asyncHandler.js";
import { created, noContent, ok } from "../utils/apiResponse.js";
import * as supplierService from "../services/supplier.service.js";

export const list = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const suppliers = await supplierService.listSuppliers({ hotelId, branchId });
  ok(res, "Suppliers", suppliers);
});

export const getById = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const supplier = await supplierService.getSupplierById({
    hotelId,
    branchId,
    id: req.params.id,
  });
  ok(res, "Supplier", supplier);
});

export const create = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const supplier = await supplierService.createSupplier({
    hotelId,
    branchId,
    input: req.body,
  });
  created(res, "Supplier created", supplier);
});

export const update = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  const supplier = await supplierService.updateSupplier({
    hotelId,
    branchId,
    id: req.params.id,
    input: req.body,
  });
  ok(res, "Supplier updated", supplier);
});

export const remove = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;
  await supplierService.deleteSupplier({
    hotelId,
    branchId,
    id: req.params.id,
  });
  noContent(res);
});
