import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChefHat, DollarSign, Percent, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AnalyticsCard,
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";
import { useRecipeQuery } from "@/features/recipes/hooks/useRecipes";
import { formatRecipeYield } from "@/features/recipes/lib/recipeYieldUnit";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "ETB",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  });
}

export function RecipeDetailsPage() {
  const { id } = useParams();
  const recipeQuery = useRecipeQuery(id);
  const recipe = recipeQuery.data;

  const columns = useMemo(
    () => [
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => (
          <div>
            <span className="font-medium">
              {row.original.inventoryItem?.name}
            </span>
            <div className="text-xs text-muted-foreground">
              Base: {row.original.inventoryItem?.baseUnit?.symbol}
            </div>
          </div>
        ),
      },
      {
        id: "qtyUnit",
        header: "Qty (unit)",
        cell: ({ row }) =>
          `${toNumber(row.original.quantity)} ${row.original.unit?.symbol}`,
      },
      {
        id: "qtyBase",
        header: "Qty (base)",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityInBaseUnit)} ${row.original.inventoryItem?.baseUnit?.symbol}`,
      },
      {
        id: "costBase",
        header: "Cost / base",
        cell: ({ row }) => formatMoney(row.original.costPerBaseUnitCents),
      },
      {
        id: "total",
        header: "Total cost",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatMoney(row.original.totalCostCents)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title={recipe?.name || "Recipe Details"}
        subtitle="Cost breakdown and ingredient bill of materials."
        actions={
          <>
            <Button asChild className="rounded-xl">
              <Link to={`/recipes/${id}/builder`}>Open builder</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/recipes">Back to recipes</Link>
            </Button>
          </>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard
          label="Recipe cost"
          value={formatMoney(recipe?.totalCostCents)}
          icon={DollarSign}
          accent="amber"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Yield"
          value={
            recipe
              ? formatRecipeYield({
                  yieldQuantity: recipe.yieldQuantity,
                  yieldUnit: recipe.yieldUnit,
                })
              : "—"
          }
          icon={ChefHat}
          accent="indigo"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Cost / yield unit"
          value={formatMoney(recipe?.costPerYieldUnit)}
          icon={DollarSign}
          accent="amber"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Selling price"
          value={formatMoney(recipe?.sellingPriceCents)}
          icon={TrendingUp}
          accent="blue"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Profit / yield unit"
          value={formatMoney(recipe?.profitPerYieldUnit)}
          icon={ChefHat}
          accent="emerald"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Food cost %"
          value={`${toNumber(recipe?.foodCostPercentage).toFixed(1)}%`}
          icon={Percent}
          accent="rose"
          loading={recipeQuery.isLoading}
        />
        <KpiCard
          label="Estimated profit margin"
          value={`${toNumber(recipe?.estimatedProfitMargin).toFixed(1)}%`}
          icon={Percent}
          accent="purple"
          loading={recipeQuery.isLoading}
        />
      </KpiGrid>

      <AnalyticsCard title="Ingredients" accent="indigo">
        <DataTable
          columns={columns}
          data={recipe?.ingredients || []}
          loading={recipeQuery.isLoading}
          enableSearch={false}
          emptyTitle="No ingredients yet"
          emptyDescription="Open the builder to add ingredients to this recipe."
        />
      </AnalyticsCard>
    </PageShell>
  );
}
