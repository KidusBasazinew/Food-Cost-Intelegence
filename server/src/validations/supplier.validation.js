import { z } from "zod";

const uuid = z.string().uuid();

export const supplierParamsSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const createSupplierSchema = {
  body: z.object({
    name: z.string().min(1).max(160),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(3).max(40).optional().nullable(),
    address: z.string().min(1).max(300).optional().nullable(),
  }),
};

export const updateSupplierSchema = {
  ...supplierParamsSchema,
  body: z
    .object({
      name: z.string().min(1).max(160).optional(),
      email: z.string().email().optional().nullable(),
      phone: z.string().min(3).max(40).optional().nullable(),
      address: z.string().min(1).max(300).optional().nullable(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};
