import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useRecipeQuery } from "@/features/recipes/hooks/useRecipes";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  const v = toNumber(cents) / 100;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function RecipeDetailsPage() {
  const { id } = useParams();
  const recipeQuery = useRecipeQuery(id);
  const recipe = recipeQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Recipe Details</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {recipe ? recipe.name : "Loading…"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to={`/recipes/${id}/builder`}>Open builder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/recipes">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(recipe?.totalCostCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Selling Price
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(recipe?.sellingPriceCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(recipe?.estimatedProfitCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {toNumber(recipe?.estimatedProfitMargin).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            %
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Quantity (unit)</th>
                  <th className="py-2">Quantity (base)</th>
                  <th className="py-2">Cost / Base</th>
                  <th className="py-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {recipeQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : (recipe?.ingredients || []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      No ingredients yet.
                    </td>
                  </tr>
                ) : (
                  recipe.ingredients.map((ing) => (
                    <tr key={ing.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        <div className="font-medium">
                          {ing.inventoryItem?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Base: {ing.inventoryItem?.baseUnit?.symbol}
                        </div>
                      </td>
                      <td className="py-2">
                        {toNumber(ing.quantity)} {ing.unit?.symbol}
                      </td>
                      <td className="py-2">
                        {toNumber(ing.quantityInBaseUnit)}{" "}
                        {ing.inventoryItem?.baseUnit?.symbol}
                      </td>
                      <td className="py-2">
                        {formatMoney(ing.costPerBaseUnitCents)}
                      </td>
                      <td className="py-2">
                        {formatMoney(ing.totalCostCents)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
