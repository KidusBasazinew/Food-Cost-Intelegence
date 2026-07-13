import { z } from "zod";

const uuid = z.string().uuid();

const decimalLike = z.union([z.string(), z.number()]);

export const inventoryItemParamsSchema = {
  params: z.object({
    id: uuid,
  }),
};

export const listInventoryItemsSchema = {
  query: z.object({
    search: z.string().trim().min(1).max(120).optional(),
    category: z
      .enum([
        "PRODUCE",
        "MEAT",
        "SEAFOOD",
        "DAIRY",
        "DRY_GOODS",
        "BEVERAGES",
        "SPICES",
        "BAKERY",
        "PACKAGING",
        "CLEANING",
        "OTHER",
      ])
      .optional(),
    lowStock: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v ? v === "true" : undefined)),
  }),
};

export const createInventoryItemSchema = {
  body: z.object({
    name: z.string().min(1).max(160),
    sku: z.string().min(1).max(64).optional(),
    category: z
      .enum([
        "PRODUCE",
        "MEAT",
        "SEAFOOD",
        "DAIRY",
        "DRY_GOODS",
        "BEVERAGES",
        "SPICES",
        "BAKERY",
        "PACKAGING",
        "CLEANING",
        "OTHER",
      ])
      .optional(),
    baseUnitId: uuid,
    minimumStockLevel: decimalLike.optional().default(0),
  }),
};

export const updateInventoryItemSchema = {
  ...inventoryItemParamsSchema,
  body: z
    .object({
      name: z.string().min(1).max(160).optional(),
      sku: z.string().min(1).max(64).optional().nullable(),
      category: z
        .enum([
          "PRODUCE",
          "MEAT",
          "SEAFOOD",
          "DAIRY",
          "DRY_GOODS",
          "BEVERAGES",
          "SPICES",
          "BAKERY",
          "PACKAGING",
          "CLEANING",
          "OTHER",
        ])
        .optional(),
      baseUnitId: uuid.optional(),
      minimumStockLevel: decimalLike.optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};

export const listInventoryTransactionsSchema = {
  query: z.object({
    inventoryItemId: uuid.optional(),
    type: z
      .enum(["PURCHASE", "ADJUSTMENT", "WASTE", "CONSUMPTION", "TRANSFER"])
      .optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
};

export const createInventoryTransactionSchema = {
  body: z
    .object({
      inventoryItemId: uuid,
      type: z.enum(["ADJUSTMENT", "WASTE", "CONSUMPTION", "TRANSFER"]),
      quantity: decimalLike,
      unitId: uuid,
      unitCostCents: decimalLike.optional(),
      note: z.string().max(500).optional(),
    })
    .superRefine((v, ctx) => {
      const qty = Number(v.quantity);
      if (!Number.isFinite(qty) || qty === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "quantity must be a non-zero number",
          path: ["quantity"],
        });
        return;
      }

      if (v.type !== "ADJUSTMENT" && qty < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "quantity must be > 0 for this transaction type",
          path: ["quantity"],
        });
      }
    }),
};
