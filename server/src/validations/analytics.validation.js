import { z } from "zod";

const uuid = z.string().uuid();

const datetime = z.string().datetime();

export const analyticsQuerySchema = {
  query: z.object({
    from: datetime.optional(),
    to: datetime.optional(),
    branchId: uuid.optional(),
    period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  }),
};

export const executiveDashboardQuerySchema = {
  query: analyticsQuerySchema.query.extend({
    supplierId: uuid.optional(),
    inventoryItemId: uuid.optional(),
    menuCategory: z.enum(["STAR", "PUZZLE", "PLOWHORSE", "DOG"]).optional(),
    topN: z.coerce.number().int().positive().max(50).optional(),
  }),
};

export const menuEngineeringQuerySchema = {
  query: analyticsQuerySchema.query.extend({
    menuCategory: z.enum(["STAR", "PUZZLE", "PLOWHORSE", "DOG"]).optional(),
    recipeId: uuid.optional(),
    topN: z.coerce.number().int().positive().max(200).optional(),
  }),
};

export const wasteAnalyticsQuerySchema = {
  query: analyticsQuerySchema.query.extend({
    inventoryItemId: uuid.optional(),
    topN: z.coerce.number().int().positive().max(200).optional(),
  }),
};

export const supplierAnalyticsQuerySchema = {
  query: analyticsQuerySchema.query.extend({
    supplierId: uuid.optional(),
    inventoryItemId: uuid.optional(),
    topN: z.coerce.number().int().positive().max(200).optional(),
  }),
};

export const inventoryForecastQuerySchema = {
  query: analyticsQuerySchema.query.extend({
    lookbackDays: z.coerce.number().int().positive().max(365).optional(),
    inventoryItemId: uuid.optional(),
    topN: z.coerce.number().int().positive().max(200).optional(),
  }),
};
