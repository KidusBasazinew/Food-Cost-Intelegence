import { z } from "zod";

const uuid = z.string().uuid();
const decimalLike = z.union([z.string(), z.number()]);

export const listConsumptionsSchema = {
  query: z.object({
    inventoryItemId: uuid.optional(),
    recipeId: uuid.optional(),
    sourceType: z
      .enum(["ORDER", "MANUAL_WASTE", "TESTING", "ADJUSTMENT"])
      .optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const consumptionReportSchema = {
  query: z.object({
    inventoryItemId: uuid.optional(),
    recipeId: uuid.optional(),
    includeWaste: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v ? v === "true" : undefined)),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const usageVelocitySchema = {
  query: z.object({
    lookbackDays: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const consumeRecipeSchema = {
  body: z.object({
    recipeId: uuid,
    servings: decimalLike,
    sourceType: z.enum(["ORDER", "TESTING", "ADJUSTMENT"]).default("ORDER"),
    sourceId: z.string().trim().max(120).optional().nullable(),
  }),
};
