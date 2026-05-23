import { z } from "zod";

const uuid = z.string().uuid();
const decimalLike = z.union([z.string(), z.number()]);

export const recipeParamsSchema = {
  params: z.object({ id: uuid }),
};

export const listRecipesSchema = {
  query: z.object({
    search: z.string().trim().min(1).max(120).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    category: z
      .enum([
        "APPETIZER",
        "MAIN",
        "SIDE",
        "SALAD",
        "SOUP",
        "BREAKFAST",
        "SNACK",
        "DESSERT",
        "DRINK",
        "OTHER",
      ])
      .optional(),
  }),
};

export const createRecipeSchema = {
  body: z.object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(500).optional().nullable(),
    imageUrl: z.string().trim().max(2048).optional().nullable(),
    category: z
      .enum([
        "APPETIZER",
        "MAIN",
        "SIDE",
        "SALAD",
        "SOUP",
        "BREAKFAST",
        "SNACK",
        "DESSERT",
        "DRINK",
        "OTHER",
      ])
      .optional(),
    menuItemId: z.string().trim().max(64).optional().nullable(),
    yieldQuantity: decimalLike.optional().default(1),
    yieldUnitId: uuid,
    preparationInstructions: z.string().trim().max(4000).optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sellingPriceCents: decimalLike.optional().default(0),
  }),
};

export const updateRecipeSchema = {
  ...recipeParamsSchema,
  body: z
    .object({
      name: z.string().trim().min(1).max(160).optional(),
      description: z.string().trim().max(500).optional().nullable(),
      imageUrl: z.string().trim().max(2048).optional().nullable(),
      category: z
        .enum([
          "APPETIZER",
          "MAIN",
          "SIDE",
          "SALAD",
          "SOUP",
          "BREAKFAST",
          "SNACK",
          "DESSERT",
          "DRINK",
          "OTHER",
        ])
        .optional(),
      menuItemId: z.string().trim().max(64).optional().nullable(),
      yieldQuantity: decimalLike.optional(),
      yieldUnitId: uuid.optional(),
      preparationInstructions: z
        .string()
        .trim()
        .max(4000)
        .optional()
        .nullable(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      sellingPriceCents: decimalLike.optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};
