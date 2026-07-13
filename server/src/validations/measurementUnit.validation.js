import { z } from "zod";

const uuid = z.string().uuid();

const decimalLike = z.union([z.string(), z.number()]);

export const measurementUnitParamsSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const createMeasurementUnitSchema = {
  body: z.object({
    name: z.string().min(1).max(120),
    symbol: z.string().min(1).max(24),
    baseType: z.enum(["G", "ML", "PIECE"]),
    conversionFactor: decimalLike.optional().default(1),
    isBaseUnit: z.boolean().optional().default(false),
  }),
};

export const updateMeasurementUnitSchema = {
  ...measurementUnitParamsSchema,
  body: z
    .object({
      name: z.string().min(1).max(120).optional(),
      symbol: z.string().min(1).max(24).optional(),
      conversionFactor: decimalLike.optional(),
      isBaseUnit: z.boolean().optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};
