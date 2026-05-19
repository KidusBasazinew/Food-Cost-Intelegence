import { z } from "zod";

const uuid = z.string().uuid();
const decimalLike = z.union([z.string(), z.number()]);

export const logWasteSchema = {
  body: z.object({
    inventoryItemId: uuid,
    quantity: decimalLike,
    unitId: uuid,
    notes: z.string().trim().max(500).optional().nullable(),
    sourceId: z.string().trim().max(120).optional().nullable(),
  }),
};

export const listWasteSchema = {
  query: z.object({
    inventoryItemId: uuid.optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const wasteReportSchema = listWasteSchema;
