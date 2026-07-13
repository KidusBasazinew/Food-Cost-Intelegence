import { z } from "zod";

const uuid = z.string().uuid();
const decimalLike = z.union([z.string(), z.number()]);

export const recipeIngredientParamsSchema = {
  params: z.object({ id: uuid }),
};

export const listRecipeIngredientsSchema = {
  query: z.object({ recipeId: uuid }),
};

export const addRecipeIngredientSchema = {
  body: z.object({
    recipeId: uuid,
    inventoryItemId: uuid,
    quantity: decimalLike,
    unitId: uuid,
    notes: z.string().trim().max(500).optional().nullable(),
  }),
};

export const updateRecipeIngredientSchema = {
  ...recipeIngredientParamsSchema,
  body: z
    .object({
      inventoryItemId: uuid.optional(),
      quantity: decimalLike.optional(),
      unitId: uuid.optional(),
      notes: z.string().trim().max(500).optional().nullable(),
    })
    .refine((v) => Object.keys(v).length > 0, {
      message: "At least one field is required",
    }),
};
