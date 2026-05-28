import { z } from "zod";

const PosOrderStatus = z.enum([
  "DRAFT",
  "SENT_TO_KITCHEN",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
]);

const posOrderItemInput = z.object({
  recipeId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  notes: z.string().max(500).optional(),
});

export const createPosOrderSchema = {
  body: z.object({
    tableNumber: z.coerce.number().int().positive(),
    waiterName: z.string().min(1).max(100),
    customerCount: z.coerce.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    items: z.array(posOrderItemInput).min(1),
  }),
};

export const updatePosOrderStatusSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ status: PosOrderStatus }),
};

export const updatePosOrderSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    waiterName: z.string().min(1).max(100),
    customerCount: z.coerce.number().int().positive().default(1),
    notes: z.string().max(1000).optional(),
    items: z.array(posOrderItemInput).min(1),
  }),
};

export const getPosOrderSchema = {
  params: z.object({ id: z.string().min(1) }),
};

export const listPosOrdersSchema = {
  query: z.object({
    status: PosOrderStatus.optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

export const listKitchenSchema = {
  query: z.object({
    status: PosOrderStatus.optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
  }),
};
