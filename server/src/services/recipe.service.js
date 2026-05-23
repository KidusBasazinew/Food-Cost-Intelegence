import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { toDecimal } from "../utils/decimal.js";
import {
  assertMoneyNonNegative,
  assertYieldQuantityValid,
  computeRecipeIngredientQuantityInBaseUnit,
  getRecipeOrThrow,
} from "./recipeValidation.service.js";
import { recalculateRecipeCosts } from "./recipeCostEngine.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function listRecipes({ hotelId, branchId, query }) {
  const where = {
    ...withBranchScope({ hotelId, branchId }),
    ...(query?.status ? { status: query.status } : {}),
    ...(query?.category ? { category: query.category } : {}),
    ...(query?.search
      ? {
          name: { contains: query.search, mode: "insensitive" },
        }
      : {}),
  };

  return prisma.recipe.findMany({
    where,
    include: {
      yieldUnit: true,
      _count: { select: { ingredients: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getRecipeById({ hotelId, branchId, id }) {
  return getRecipeOrThrow({ hotelId, branchId, id });
}

export async function createRecipe({ hotelId, branchId, input }) {
  const yieldQty = assertYieldQuantityValid(input.yieldQuantity);
  const sellingPrice = assertMoneyNonNegative(
    input.sellingPriceCents,
    "INVALID_SELLING_PRICE",
  );

  const yieldUnit = await prisma.measurementUnit.findUnique({
    where: { id: input.yieldUnitId },
  });

  if (!yieldUnit) {
    throw new ApiError(400, "INVALID_YIELD_UNIT", "Yield unit not found");
  }

  const recipe = await prisma.recipe.create({
    data: {
      hotelId,
      branchId: branchId ?? null,
      menuItemId: input.menuItemId ?? null,
      name: input.name,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      category: input.category ?? "OTHER",
      yieldQuantity: toDecimal(yieldQty),
      yieldUnitId: yieldUnit.id,
      preparationInstructions: input.preparationInstructions ?? null,
      status: input.status ?? "ACTIVE",
      sellingPriceCents: toDecimal(sellingPrice),
    },
    include: { yieldUnit: true },
  });

  // Initialize computed fields.
  return recalculateRecipeCosts({ hotelId, branchId, recipeId: recipe.id });
}

export async function updateRecipe({ hotelId, branchId, id, input }) {
  const recipe = await getRecipeOrThrow({ hotelId, branchId, id });

  if (input.yieldQuantity != null) {
    assertYieldQuantityValid(input.yieldQuantity);
  }

  if (input.sellingPriceCents != null) {
    assertMoneyNonNegative(input.sellingPriceCents, "INVALID_SELLING_PRICE");
  }

  if (input.yieldUnitId) {
    const unit = await prisma.measurementUnit.findUnique({
      where: { id: input.yieldUnitId },
    });
    if (!unit) {
      throw new ApiError(400, "INVALID_YIELD_UNIT", "Yield unit not found");
    }
  }

  await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      name: input.name ?? undefined,
      description:
        input.description === undefined ? undefined : input.description,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl,
      category: input.category ?? undefined,
      menuItemId: input.menuItemId === undefined ? undefined : input.menuItemId,
      yieldQuantity:
        input.yieldQuantity === undefined
          ? undefined
          : toDecimal(input.yieldQuantity),
      yieldUnitId: input.yieldUnitId ?? undefined,
      preparationInstructions:
        input.preparationInstructions === undefined
          ? undefined
          : input.preparationInstructions,
      status: input.status ?? undefined,
      sellingPriceCents:
        input.sellingPriceCents === undefined
          ? undefined
          : toDecimal(input.sellingPriceCents),
    },
  });

  return recalculateRecipeCosts({ hotelId, branchId, recipeId: recipe.id });
}

export async function deleteRecipe({ hotelId, branchId, id }) {
  const recipe = await getRecipeOrThrow({ hotelId, branchId, id });
  await prisma.recipe.delete({ where: { id: recipe.id } });
}

export async function listRecipeIngredients({ hotelId, branchId, recipeId }) {
  // Ensure recipe exists and is scoped.
  await getRecipeOrThrow({ hotelId, branchId, id: recipeId });

  return prisma.recipeIngredient.findMany({
    where: { recipeId },
    include: {
      unit: true,
      inventoryItem: { include: { baseUnit: true } },
    },
    orderBy: [{ createdAt: "asc" }],
  });
}

export async function addRecipeIngredient({
  hotelId,
  branchId,
  recipeId,
  input,
}) {
  const recipe = await getRecipeOrThrow({ hotelId, branchId, id: recipeId });

  const item = await prisma.inventoryItem.findFirst({
    where: {
      id: input.inventoryItemId,
      ...withBranchScope({ hotelId, branchId }),
    },
    include: { baseUnit: true },
  });

  if (!item) {
    throw new ApiError(
      400,
      "INVALID_INVENTORY_ITEM",
      "Inventory item not found",
    );
  }

  const unit = await prisma.measurementUnit.findUnique({
    where: { id: input.unitId },
  });

  if (!unit) throw new ApiError(400, "INVALID_UNIT", "Unit not found");

  const quantityInBaseUnit = computeRecipeIngredientQuantityInBaseUnit({
    quantity: input.quantity,
    unit,
    inventoryItemBaseUnit: item.baseUnit,
  });

  await prisma.recipeIngredient.create({
    data: {
      recipeId: recipe.id,
      inventoryItemId: item.id,
      quantity: toDecimal(input.quantity),
      unitId: unit.id,
      quantityInBaseUnit,
      notes: input.notes ?? null,
    },
  });

  return recalculateRecipeCosts({ hotelId, branchId, recipeId: recipe.id });
}

export async function updateRecipeIngredient({
  hotelId,
  branchId,
  ingredientId,
  input,
}) {
  return prisma.$transaction(async (tx) => {
    const ingredient = await tx.recipeIngredient.findFirst({
      where: { id: ingredientId },
      include: {
        recipe: true,
        inventoryItem: { include: { baseUnit: true } },
        unit: true,
      },
    });

    if (!ingredient) {
      throw new ApiError(404, "NOT_FOUND", "Recipe ingredient not found");
    }

    // Scope check via recipe.
    await getRecipeOrThrow({
      hotelId,
      branchId,
      id: ingredient.recipeId,
      tx,
    });

    const nextInventoryItemId =
      input.inventoryItemId ?? ingredient.inventoryItemId;
    const nextUnitId = input.unitId ?? ingredient.unitId;

    const item =
      nextInventoryItemId === ingredient.inventoryItemId
        ? ingredient.inventoryItem
        : await tx.inventoryItem.findFirst({
            where: {
              id: nextInventoryItemId,
              ...withBranchScope({ hotelId, branchId }),
            },
            include: { baseUnit: true },
          });

    if (!item) {
      throw new ApiError(
        400,
        "INVALID_INVENTORY_ITEM",
        "Inventory item not found",
      );
    }

    const unit =
      nextUnitId === ingredient.unitId
        ? ingredient.unit
        : await tx.measurementUnit.findUnique({ where: { id: nextUnitId } });

    if (!unit) throw new ApiError(400, "INVALID_UNIT", "Unit not found");

    const qty = input.quantity ?? ingredient.quantity;

    const quantityInBaseUnit = computeRecipeIngredientQuantityInBaseUnit({
      quantity: qty,
      unit,
      inventoryItemBaseUnit: item.baseUnit,
    });

    await tx.recipeIngredient.update({
      where: { id: ingredient.id },
      data: {
        inventoryItemId: input.inventoryItemId ?? undefined,
        unitId: input.unitId ?? undefined,
        quantity:
          input.quantity === undefined ? undefined : toDecimal(input.quantity),
        quantityInBaseUnit,
        notes: input.notes === undefined ? undefined : input.notes,
      },
    });

    return recalculateRecipeCosts({
      hotelId,
      branchId,
      recipeId: ingredient.recipeId,
    });
  });
}

export async function deleteRecipeIngredient({
  hotelId,
  branchId,
  ingredientId,
}) {
  const ingredient = await prisma.recipeIngredient.findFirst({
    where: { id: ingredientId },
    include: { recipe: true },
  });

  if (!ingredient) {
    throw new ApiError(404, "NOT_FOUND", "Recipe ingredient not found");
  }

  await getRecipeOrThrow({ hotelId, branchId, id: ingredient.recipeId });

  await prisma.recipeIngredient.delete({ where: { id: ingredient.id } });

  return recalculateRecipeCosts({
    hotelId,
    branchId,
    recipeId: ingredient.recipeId,
  });
}

export async function recalcRecipe({ hotelId, branchId, id }) {
  await getRecipeOrThrow({ hotelId, branchId, id });
  return recalculateRecipeCosts({ hotelId, branchId, recipeId: id });
}
