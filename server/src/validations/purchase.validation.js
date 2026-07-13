import { z } from "zod";

const uuid = z.string().uuid();
const decimalLike = z.union([z.string(), z.number()]);

export const purchaseParamsSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const listPurchasesSchema = {
  query: z.object({
    status: z.enum(["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"]).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const createPurchaseSchema = {
  body: z.object({
    supplierId: uuid,
    orderedAt: z.string().datetime().optional(),
    expectedAt: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
    taxCents: decimalLike.optional().default(0),
    items: z
      .array(
        z.object({
          inventoryItemId: uuid,
          unitId: uuid,
          quantity: decimalLike,
          unitCostCents: decimalLike,
        }),
      )
      .min(1),
  }),
};

export const updatePurchaseSchema = {
  ...purchaseParamsSchema,
  body: z
    .object({
      status: z.enum(["DRAFT", "ORDERED", "RECEIVED", "CANCELLED"]).optional(),
      orderedAt: z.string().datetime().optional().nullable(),
      expectedAt: z.string().datetime().optional().nullable(),
      receivedAt: z.string().datetime().optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
      taxCents: decimalLike.optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};
