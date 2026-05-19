import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/apiError.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import { validateInventoryAvailability } from "../lib/inventoryEngine.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export async function getRecipeOrThrow({ hotelId, branchId, id, tx }) {
  const client = tx ?? prisma;

  const recipe = await client.recipe.findFirst({
    where: { id, ...withBranchScope({ hotelId, branchId }) },
    include: {
      yieldUnit: true,
      ingredients: {
        include: {
          unit: true,
          inventoryItem: { include: { baseUnit: true } },
        },
        orderBy: [{ createdAt: "asc" }],
      },
    },
  });

  if (!recipe) throw new ApiError(404, "NOT_FOUND", "Recipe not found");
  return recipe;
}

export function assertRecipeIsActive(recipe) {
  if (recipe.status !== "ACTIVE") {
    throw new ApiError(400, "RECIPE_INACTIVE", "Recipe is inactive");
  }
}

export function assertServingsPositive(servings) {
  const s = toDecimal(servings);
  if (s.lte(0)) {
    throw new ApiError(400, "INVALID_SERVINGS", "servings must be > 0");
  }
  return s;
}

export function validateRecipeInventory({ recipe, servings }) {
  const servingsDec = assertServingsPositive(servings);

  for (const ingredient of recipe.ingredients ?? []) {
    const item = ingredient.inventoryItem;
    if (!item) {
      throw new ApiError(
        400,
        "INVALID_RECIPE",
        "Recipe ingredient inventory item not found",
      );
    }

    const requiredBase = toDecimal(ingredient.quantityInBaseUnit).mul(
      servingsDec,
    );

    validateInventoryAvailability({
      quantityInStock: item.quantityInStock,
      requiredQtyInBaseUnit: requiredBase,
    });
  }
}

export function computeRecipeIngredientQuantityInBaseUnit({
  quantity,
  unit,
  inventoryItemBaseUnit,
}) {
  if (!unit || !inventoryItemBaseUnit) {
    throw new ApiError(400, "INVALID_UNIT", "Missing unit/base unit");
  }

  if (unit.baseType !== inventoryItemBaseUnit.baseType) {
    throw new ApiError(
      400,
      "UNIT_MISMATCH",
      "Ingredient unit base type does not match inventory item base unit",
    );
  }

  const qty = toDecimal(quantity);
  if (qty.lte(0)) {
    throw new ApiError(400, "INVALID_QUANTITY", "quantity must be > 0");
  }

  const unitFactor = toDecimal(unit.conversionFactor);
  const baseFactor = toDecimal(inventoryItemBaseUnit.conversionFactor);

  if (unitFactor.lte(0) || baseFactor.lte(0)) {
    throw new ApiError(400, "INVALID_UNIT", "Invalid conversion factor");
  }

  // quantityInBase = quantity * (unitFactor / baseFactor)
  return qty.mul(unitFactor).div(baseFactor);
}

export function assertYieldQuantityValid(yieldQuantity) {
  const y = toDecimal(yieldQuantity ?? 1);
  if (y.lte(0)) {
    throw new ApiError(400, "INVALID_YIELD", "yieldQuantity must be > 0");
  }
  return y;
}

export function assertMoneyNonNegative(value, code) {
  const v = toDecimal(value ?? 0);
  if (v.lt(0)) {
    throw new ApiError(400, code, "Value cannot be negative");
  }
  return v;
}

export function ensureDecimalField(value) {
  return value instanceof Decimal ? value : toDecimal(value);
}
