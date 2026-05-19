import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useFoodCostReportQuery } from "@/features/intelligence/hooks/useFoodCost";
import {
  Bar,
  BarChart,
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

export function FoodCostDashboardPage() {
  const reportQuery = useFoodCostReportQuery({ status: "ACTIVE" });
  const recipes = reportQuery.data || [];

  const kpis = useMemo(() => {
    const totalCost = recipes.reduce(
      (acc, r) => acc + toNumber(r.totalCostCents),
      0,
    );
    const totalSelling = recipes.reduce(
      (acc, r) => acc + toNumber(r.sellingPriceCents),
      0,
    );
    const avgMargin = recipes.length
      ? recipes.reduce((acc, r) => acc + toNumber(r.estimatedProfitMargin), 0) /
        recipes.length
      : 0;

    return {
      count: recipes.length,
      totalCost,
      totalSelling,
      avgMargin,
    };
  }, [recipes]);

  const topMargin = useMemo(() => {
    return [...recipes]
      .sort(
        (a, b) =>
          toNumber(b.estimatedProfitMargin) - toNumber(a.estimatedProfitMargin),
      )
      .slice(0, 8)
      .map((r) => ({
        name: r.name,
        margin: toNumber(r.estimatedProfitMargin),
      }));
  }, [recipes]);

  const lowMargin = useMemo(() => {
    return [...recipes]
      .sort(
        (a, b) =>
          toNumber(a.estimatedProfitMargin) - toNumber(b.estimatedProfitMargin),
      )
      .slice(0, 8);
  }, [recipes]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">Food Cost Dashboard</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Menu-level cost, profit, and margin intelligence.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active recipes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {kpis.count}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total cost (sum)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(kpis.totalCost)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total selling (sum)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {formatMoney(kpis.totalSelling)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg margin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {kpis.avgMargin.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            %
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top profit margin
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: 320 }}>
            {reportQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : topMargin.length === 0 ? (
              <div className="text-sm text-muted-foreground">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMargin} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(2)}%`, "Margin"]}
                  />
                  <Bar dataKey="margin" fill="currentColor" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Low margin meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Recipe</th>
                    <th className="py-2">Cost</th>
                    <th className="py-2">Selling</th>
                    <th className="py-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {reportQuery.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={4}>
                        Loading…
                      </td>
                    </tr>
                  ) : lowMargin.length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={4}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    lowMargin.map((r) => (
                      <tr key={r.id} className="border-b last:border-b-0">
                        <td className="py-2 font-medium">{r.name}</td>
                        <td className="py-2">
                          {formatMoney(r.totalCostCents)}
                        </td>
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
