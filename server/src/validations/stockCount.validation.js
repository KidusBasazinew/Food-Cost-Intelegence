import { z } from "zod";

const uuid = z.string().uuid();
const datetime = z.string().datetime();
const decimalLike = z.union([z.string(), z.number()]);

export const stockCountIdParamsSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const stockCountItemParamsSchema = {
  params: z.object({
    id: uuid,
    itemId: uuid,
  }),
};

export const createStockCountSchema = {
  body: z
    .object({
      branchId: uuid.optional().nullable(),
      countedBy: z.string().min(1).max(120).optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
    })
    .default({}),
};

export const updateStockCountSchema = {
  ...stockCountIdParamsSchema,
  body: z
    .object({
      countedBy: z.string().min(1).max(120).optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};

export const listStockCountsSchema = {
  query: z
    .object({
      status: z.enum(["DRAFT", "COMPLETED"]).optional(),
      from: datetime.optional(),
      to: datetime.optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    })
    .default({}),
};

export const upsertStockCountItemSchema = {
  ...stockCountIdParamsSchema,
  body: z.object({
    inventoryItemId: uuid,
    physicalQuantity: decimalLike,
  }),
};

export const completeStockCountSchema = {
  ...stockCountIdParamsSchema,
};
