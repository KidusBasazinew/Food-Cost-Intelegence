import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { prisma } from "../prisma/client.js";
import { recalculateRecipeCosts } from "../services/recipeCostEngine.service.js";
import { withRecipeYieldMetrics } from "../services/recipeYieldMetrics.service.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

export const foodCostReport = asyncHandler(async (req, res) => {
  const { hotelId, branchId } = req.auth;

  if (req.query.recalculate === true) {
    const recipes = await prisma.recipe.findMany({
      where: { ...withBranchScope({ hotelId, branchId }) },
      select: { id: true },
    });
    for (const r of recipes) {
      // Sequential keeps DB load predictable.
      // eslint-disable-next-line no-await-in-loop
      await recalculateRecipeCosts({ hotelId, branchId, recipeId: r.id });
    }
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      ...withBranchScope({ hotelId, branchId }),
      ...(req.query.status ? { status: req.query.status } : {}),
    },
    include: {
      _count: { select: { ingredients: true } },
    },
    orderBy: [{ estimatedProfitMargin: "desc" }],
  });

  ok(res, "Food cost report", recipes.map(withRecipeYieldMetrics));
});
