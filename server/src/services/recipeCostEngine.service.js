import { prisma } from "../prisma/client.js";
import { Decimal, toDecimal } from "../utils/decimal.js";
import { ApiError } from "../utils/apiError.js";
import {
  calculateProfitCents,
  calculateProfitMarginPercent,
} from "./profitCalculation.service.js";
import { withRecipeYieldMetrics } from "./recipeYieldMetrics.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export function calculateRecipeCost({ ingredients }) {
  let total = new Decimal(0);
  for (const ing of ingredients ?? []) {
    const qtyBase = toDecimal(ing.quantityInBaseUnit);
    const costPerBase = toDecimal(ing.costPerBaseUnitCents ?? 0);
    total = total.add(qtyBase.mul(costPerBase));
  }
  return total;
}

export async function recalculateRecipeCosts({ hotelId, branchId, recipeId }) {
  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.findFirst({
      where: { id: recipeId, ...withBranchScope({ hotelId, branchId }) },
      include: {
        ingredients: {
          include: {
            inventoryItem: { include: { baseUnit: true } },
            unit: true,
          },
        },
      },
    });

    if (!recipe) throw new ApiError(404, "NOT_FOUND", "Recipe not found");

    // Update each ingredient's cost snapshot from current weighted average.
    for (const ing of recipe.ingredients) {
      const avg = toDecimal(
        ing.inventoryItem?.averageCostPerBaseUnitCents ?? 0,
      );
      const qtyBase = toDecimal(ing.quantityInBaseUnit);
      const totalCost = qtyBase.mul(avg);

      await tx.recipeIngredient.update({
        where: { id: ing.id },
        data: {
          costPerBaseUnitCents: avg,
          totalCostCents: totalCost,
        },
      });
    }

    const refreshedIngredients = await tx.recipeIngredient.findMany({
      where: { recipeId: recipe.id },
      include: {
        unit: true,
        inventoryItem: { include: { baseUnit: true } },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    const totalCostCents = calculateRecipeCost({
      ingredients: refreshedIngredients,
    });

    const yieldQty = toDecimal(recipe.yieldQuantity ?? 1);
    const costPerYieldUnit = yieldQty.lte(0)
      ? new Decimal(0)
      : totalCostCents.div(yieldQty);

    const profitCents = calculateProfitCents({
      sellingPriceCents: recipe.sellingPriceCents,
      totalCostCents: costPerYieldUnit,
    });

    const margin = calculateProfitMarginPercent({
      sellingPriceCents: recipe.sellingPriceCents,
      profitCents,
    });

    const updatedRecipe = await tx.recipe.update({
      where: { id: recipe.id },
      data: {
        totalCostCents,
        estimatedProfitCents: profitCents,
        estimatedProfitMargin: margin,
      },
      include: {
        ingredients: {
          include: {
            unit: true,
            inventoryItem: { include: { baseUnit: true } },
          },
          orderBy: [{ createdAt: "asc" }],
        },
      },
    });

    return withRecipeYieldMetrics(updatedRecipe);
  });
}
