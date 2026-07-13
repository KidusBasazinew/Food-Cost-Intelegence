import { prisma } from "../../prisma/client.js";
import { Decimal, toDecimal } from "../../utils/decimal.js";
import { percent } from "./analyticsHelpers.js";

function withBranchScope({ hotelId, branchId }) {
  if (branchId) {
    return {
      hotelId,
      OR: [{ branchId }, { branchId: null }],
    };
  }
  return { hotelId };
}

function classifyMenuItems(items) {
  if (!items.length) return items;

  const avgSales = items
    .reduce((acc, i) => acc.add(toDecimal(i.totalSalesCount)), new Decimal(0))
    .div(new Decimal(items.length));
  const avgProfitPerSale = items
    .reduce(
      (acc, i) => acc.add(toDecimal(i.profitPerSaleCents)),
      new Decimal(0),
    )
    .div(new Decimal(items.length));

  return items.map((i) => {
    const highPopularity = toDecimal(i.totalSalesCount).gte(avgSales);
    const highProfit = toDecimal(i.profitPerSaleCents).gte(avgProfitPerSale);

    let engineeringCategory = "DOG";
    if (highPopularity && highProfit) engineeringCategory = "STAR";
    else if (!highPopularity && highProfit) engineeringCategory = "PUZZLE";
    else if (highPopularity && !highProfit) engineeringCategory = "PLOWHORSE";

    return { ...i, engineeringCategory };
  });
}

export async function getMenuEngineering({
  hotelId,
  branchId,
  from,
  to,
  filter,
}) {
  const salesByRecipe = await prisma.salesOrderItem.groupBy({
    by: ["recipeId"],
    where: {
      salesOrder: {
        hotelId,
        ...(branchId ? { branchId } : {}),
        status: "COMPLETED",
        orderedAt: { gte: from, lte: to },
      },
      ...(filter?.recipeId ? { recipeId: filter.recipeId } : {}),
    },
    _sum: { quantity: true, totalRevenueCents: true },
  });

  const cogsByRecipe = await prisma.inventoryConsumption.groupBy({
    by: ["recipeId"],
    where: {
      ...withBranchScope({ hotelId, branchId }),
      sourceType: "ORDER",
      recipeId: { not: null },
      createdAt: { gte: from, lte: to },
      ...(filter?.recipeId ? { recipeId: filter.recipeId } : {}),
    },
    _sum: { totalCostCents: true },
  });

  const recipeIds = Array.from(
    new Set([
      ...salesByRecipe.map((r) => r.recipeId),
      ...cogsByRecipe.map((r) => r.recipeId).filter(Boolean),
    ]),
  );

  const recipes = recipeIds.length
    ? await prisma.recipe.findMany({
        where: {
          id: { in: recipeIds },
          ...withBranchScope({ hotelId, branchId }),
        },
        select: {
          id: true,
          name: true,
          sellingPriceCents: true,
          totalCostCents: true,
        },
      })
    : [];

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const cogsMap = new Map(
    cogsByRecipe.map((r) => [
      r.recipeId,
      toDecimal(r._sum.totalCostCents ?? 0),
    ]),
  );

  const totals = salesByRecipe.reduce(
    (acc, r) => acc.add(toDecimal(r._sum.quantity ?? 0)),
    new Decimal(0),
  );

  const rows = salesByRecipe.map((r) => {
    const recipe = recipeMap.get(r.recipeId);
    const salesCount = toDecimal(r._sum.quantity ?? 0);
    const revenueCents = toDecimal(r._sum.totalRevenueCents ?? 0);

    // Prefer actual consumption-based COGS; fallback to recipe-level estimate if missing.
    const actualCogs = cogsMap.get(r.recipeId) ?? new Decimal(0);
    const estCogs = recipe
      ? toDecimal(recipe.totalCostCents ?? 0).mul(salesCount)
      : new Decimal(0);
    const ingredientCostCents = actualCogs.gt(0) ? actualCogs : estCogs;

    const profitCents = revenueCents.sub(ingredientCostCents);

    const foodCostPercentage = percent(ingredientCostCents, revenueCents);
    const grossMarginPercentage = percent(profitCents, revenueCents);

    const popularityScore = totals.lte(0)
      ? new Decimal(0)
      : salesCount.div(totals).mul(new Decimal(100));

    const profitPerSaleCents = salesCount.lte(0)
      ? new Decimal(0)
      : profitCents.div(salesCount);

    return {
      recipeId: r.recipeId,
      name: recipe?.name ?? "Unknown",
      sellingPriceCents: toDecimal(recipe?.sellingPriceCents ?? 0),
      totalSalesCount: salesCount,
      totalRevenueCents: revenueCents,
      totalIngredientCostCents: ingredientCostCents,
      totalProfitCents: profitCents,
      foodCostPercentage,
      grossMarginPercentage,
      popularityScore,
      contributionMarginCents: profitPerSaleCents,
      profitPerSaleCents,
    };
  });

  const classified = classifyMenuItems(rows);

  const filtered = filter?.menuCategory
    ? classified.filter((r) => r.engineeringCategory === filter.menuCategory)
    : classified;

  const topN = Number(filter?.topN ?? 50);
  const byProfit = [...filtered].sort((a, b) =>
    toDecimal(b.totalProfitCents).cmp(toDecimal(a.totalProfitCents)),
  );

  return {
    totalMenuItems: filtered.length,
    totals: {
      totalSalesCount: totals,
      totalRevenueCents: filtered.reduce(
        (acc, x) => acc.add(toDecimal(x.totalRevenueCents)),
        new Decimal(0),
      ),
      totalIngredientCostCents: filtered.reduce(
        (acc, x) => acc.add(toDecimal(x.totalIngredientCostCents)),
        new Decimal(0),
      ),
      totalProfitCents: filtered.reduce(
        (acc, x) => acc.add(toDecimal(x.totalProfitCents)),
        new Decimal(0),
      ),
    },
    items: filtered,
    topProfitable: byProfit.slice(0, topN),
    categoryCounts: filtered.reduce((acc, x) => {
      acc[x.engineeringCategory] = (acc[x.engineeringCategory] ?? 0) + 1;
      return acc;
    }, /** @type {Record<string, number>} */ ({})),
  };
}

export async function generateMenuAnalyticsSnapshots({
  hotelId,
  branchId,
  from,
  to,
  period,
  snapshotDate,
}) {
  const report = await getMenuEngineering({
    hotelId,
    branchId,
    from,
    to,
    filter: {},
  });

  const rows = report.items;
  if (!rows.length) return { created: 0 };

  const data = rows.map((r) => ({
    menuItemId: r.recipeId,
    branchId,
    period,
    snapshotDate,
    totalSalesCount: r.totalSalesCount,
    totalRevenueCents: r.totalRevenueCents,
    totalIngredientCostCents: r.totalIngredientCostCents,
    totalProfitCents: r.totalProfitCents,
    foodCostPercentage: r.foodCostPercentage,
    grossMarginPercentage: r.grossMarginPercentage,
    engineeringCategory: r.engineeringCategory,
  }));

  // If branchId is null, snapshots cannot be stored because branchId is required.
  // Enforce an explicit branch filter for snapshot generation.
  if (!branchId) {
    return { created: 0, warning: "branchId is required to persist snapshots" };
  }

  // Use createMany; ignore duplicates for idempotency.
  const created = await prisma.menuAnalyticsSnapshot.createMany({
    data,
    skipDuplicates: true,
  });

  return { created: created.count };
}
