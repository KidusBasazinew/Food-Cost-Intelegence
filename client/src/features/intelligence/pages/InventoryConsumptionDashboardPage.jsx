import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useConsumeRecipeMutation,
  useConsumptionReportQuery,
  useConsumptionsQuery,
  useUsageVelocityQuery,
} from "@/features/intelligence/hooks/useConsumption";
import { useRecipesQuery } from "@/features/recipes/hooks/useRecipes";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export function InventoryConsumptionDashboardPage() {
  const recipesQuery = useRecipesQuery({ status: "ACTIVE" });
  const consumeMutation = useConsumeRecipeMutation();
  const consumptionsQuery = useConsumptionsQuery({});
  const reportQuery = useConsumptionReportQuery({});
  const velocityQuery = useUsageVelocityQuery({ lookbackDays: "30" });

  const [order, setOrder] = useState({
    recipeId: "",
    servings: "1",
    sourceType: "ORDER",
    sourceId: "",
  });

  const report = reportQuery.data;
  const daily = report?.daily || [];
  const topItems = report?.topItems || [];

  const chartData = useMemo(() => {
    return daily.map((d) => ({
      day: d.day,
      cost: toNumber(d.totalCostCents) / 100,
    }));
  }, [daily]);

  const recipes = recipesQuery.data || [];
  const consumptions = consumptionsQuery.data || [];

  const canConsume =
    Boolean(order.recipeId) &&
    toNumber(order.servings) > 0 &&
    !consumeMutation.isPending;

  async function submitConsume(e) {
    e.preventDefault();
    if (!canConsume) return;

    try {
      await consumeMutation.mutateAsync({
        recipeId: order.recipeId,
        servings: order.servings,
        sourceType: order.sourceType,
        sourceId: order.sourceId.trim() ? order.sourceId.trim() : undefined,
      });
      toast.success("Consumption recorded");
      setOrder((o) => ({ ...o, servings: "1", sourceId: "" }));
    } catch (err) {
      toast.error(err?.message || "Failed to record consumption");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">
          Inventory Consumption Dashboard
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Ingredient usage, spend trends, and depletion speed.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Record order consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitConsume} className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">
                Recipe (ordered item)
              </div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={order.recipeId}
                onChange={(e) =>
                  setOrder((o) => ({ ...o, recipeId: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-muted-foreground">
                This calls{" "}
                <span className="font-mono">
                  /inventory-consumption/consume-recipe
                </span>{" "}
                and deducts stock.
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Servings</div>
              <Input
                value={order.servings}
                onChange={(e) =>
                  setOrder((o) => ({ ...o, servings: e.target.value }))
                }
                placeholder="1"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Source</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={order.sourceType}
                onChange={(e) =>
                  setOrder((o) => ({ ...o, sourceType: e.target.value }))
                }
              >
                <option value="ORDER">ORDER</option>
                <option value="TESTING">TESTING</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Order ref (optional)
              </div>
              <Input
                value={order.sourceId}
                onChange={(e) =>
                  setOrder((o) => ({ ...o, sourceId: e.target.value }))
                }
                placeholder="e.g. Table 3 - Ticket 0182"
              />
            </div>

            <div className="md:col-span-5">
              <Button type="submit" disabled={!canConsume}>
                {consumeMutation.isPending
                  ? "Recording…"
                  : "Record consumption"}
              </Button>
              {(recipesQuery.isLoading || consumptionsQuery.isLoading) && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Loading…
                </span>
              )}
            </div>
          </form>

          <div className="mt-4 overflow-x-auto">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Recent consumptions
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Time</th>
                  <th className="py-2">Recipe</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty (base)</th>
                  <th className="py-2">Cost</th>
                  <th className="py-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {consumptionsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : consumptions.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      No consumption rows yet.
                    </td>
                  </tr>
                ) : (
                  consumptions.slice(0, 15).map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 font-medium">
                        {c.recipe?.name ?? "—"}
                      </td>
                      <td className="py-2">{c.inventoryItem?.name ?? "—"}</td>
                      <td className="py-2">
                        {toNumber(c.quantityConsumedBaseUnit).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 4,
                          },
                        )}{" "}
                        {c.inventoryItem?.baseUnit?.symbol}
                      </td>
                      <td className="py-2">{formatMoney(c.totalCostCents)}</td>
                      <td className="py-2">
                        {c.sourceType}
                        {c.sourceId ? (
                          <div className="text-xs text-muted-foreground">
                            {c.sourceId}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total consumption cost
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(report?.totalCostCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total deductions (rows)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {report?.totalRows ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Top consumed item (cost)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {topItems[0]?.name ?? "—"}
            <div className="text-xs text-muted-foreground">
              {topItems[0] ? formatMoney(topItems[0].totalCostCents) : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Daily spend trend
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: 320 }}>
            {reportQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : chartData.length === 0 ? (
              <div className="text-sm text-muted-foreground">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" hide />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => [
                      Number(v).toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                      }),
                      "Cost",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Item</th>
                    <th className="py-2">Qty (base)</th>
                    <th className="py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {reportQuery.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        Loading…
                      </td>
                    </tr>
                  ) : topItems.length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    topItems.slice(0, 10).map((i) => (
                      <tr
                        key={i.inventoryItemId}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 font-medium">{i.name}</td>
                        <td className="py-2">
                          {toNumber(i.totalQuantityBaseUnit).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 4,
                            },
                          )}{" "}
                          {i.baseUnitSymbol}
                        </td>
                        <td className="py-2">
                          {formatMoney(i.totalCostCents)}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Usage velocity (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Avg daily usage</th>
                  <th className="py-2">In stock</th>
                  <th className="py-2">Days remaining (est.)</th>
                </tr>
              </thead>
              <tbody>
                {velocityQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : (velocityQuery.data?.items || []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  velocityQuery.data.items.slice(0, 12).map((v) => (
                    <tr
                      key={v.inventoryItemId}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-2 font-medium">{v.name}</td>
                      <td className="py-2">
                        {toNumber(v.avgDailyUsageBaseUnit).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 4,
                          },
                        )}{" "}
                        {v.baseUnitSymbol}
                      </td>
                      <td className="py-2">
                        {toNumber(v.quantityInStock).toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })}{" "}
                        {v.baseUnitSymbol}
                      </td>
                      <td className="py-2">
                        {v.estimatedDaysRemaining == null
                          ? "—"
                          : toNumber(v.estimatedDaysRemaining).toLocaleString(
                              undefined,
                              {
                                maximumFractionDigits: 1,
                              },
                            )}
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
