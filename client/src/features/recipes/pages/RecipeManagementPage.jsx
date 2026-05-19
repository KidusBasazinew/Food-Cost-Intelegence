import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  useCreateRecipeMutation,
  useRecipesQuery,
} from "@/features/recipes/hooks/useRecipes";

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

export function RecipeManagementPage() {
  const recipesQuery = useRecipesQuery();
  const unitsQuery = useMeasurementUnitsQuery();

  const createMutation = useCreateRecipeMutation();

  const units = useMemo(() => unitsQuery.data || [], [unitsQuery.data]);

  const [form, setForm] = useState({
    name: "",
    yieldQuantity: "1",
    yieldUnitId: "",
    sellingPriceCents: "0",
    status: "ACTIVE",
  });

  const canSubmit =
    form.name.trim().length > 0 &&
    form.yieldUnitId &&
    !createMutation.isPending;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    await createMutation.mutateAsync({
      name: form.name.trim(),
      yieldQuantity: form.yieldQuantity,
      yieldUnitId: form.yieldUnitId,
      sellingPriceCents: form.sellingPriceCents,
      status: form.status,
    });

    setForm((f) => ({ ...f, name: "" }));
  }

  const recipes = recipesQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Recipe Management</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Build recipes from inventory items. Costs update dynamically from
            weighted average inventory costing.
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/food-cost">Food cost dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Create Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Chicken Stew"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Yield Qty</div>
              <Input
                value={form.yieldQuantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, yieldQuantity: e.target.value }))
                }
                placeholder="1"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Yield Unit</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.yieldUnitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, yieldUnitId: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Selling Price (cents)
              </div>
              <Input
                value={form.sellingPriceCents}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sellingPriceCents: e.target.value }))
                }
                placeholder="0"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <Button type="submit" disabled={!canSubmit}>
                {createMutation.isPending ? "Creating…" : "Create recipe"}
              </Button>
              {unitsQuery.isLoading && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Loading measurement units…
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Yield</th>
                  <th className="py-2">Ingredients</th>
                  <th className="py-2">Total Cost</th>
                  <th className="py-2">Selling</th>
                  <th className="py-2">Margin</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {recipesQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={8}>
                      Loading…
                    </td>
                  </tr>
                ) : recipes.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={8}>
                      No recipes yet.
                    </td>
                  </tr>
                ) : (
                  recipes.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        <Link
                          className="font-medium hover:underline"
                          to={`/recipes/${r.id}`}
                        >
                          {r.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          Updated {new Date(r.updatedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2">
                        {toNumber(r.yieldQuantity)} {r.yieldUnit?.symbol}
                      </td>
                      <td className="py-2">{r._count?.ingredients ?? 0}</td>
                      <td className="py-2">{formatMoney(r.totalCostCents)}</td>
                      <td className="py-2">
                        {formatMoney(r.sellingPriceCents)}
                      </td>
                      <td className="py-2">
                        {toNumber(r.estimatedProfitMargin).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          },
                        )}
                        %
                      </td>
                      <td className="py-2">{r.status}</td>
                      <td className="py-2">
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/recipes/${r.id}/builder`}>Builder</Link>
                        </Button>
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
