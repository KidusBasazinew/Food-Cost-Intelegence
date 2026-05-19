import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { KpiCard } from "@/features/analytics/components/KpiCard";
import { useExecutiveDashboardQuery } from "@/features/analytics/hooks/useExecutiveDashboard";
import {
  isoEndOfDay,
  isoStartOfDay,
  daysAgoISODate,
  todayISODate,
} from "@/features/analytics/utils/dates";
import {
  formatMoney,
  formatPct,
  toNumber,
} from "@/features/analytics/utils/numbers";
import { RevenueCostTrendChart } from "@/features/analytics/charts/RevenueCostTrendChart";
import { MenuCategoryPie } from "@/features/analytics/charts/MenuCategoryPie";
import { useSuppliersQuery } from "@/features/inventory/hooks/useSuppliers";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";

function buildParams(filters) {
  return {
    from: isoStartOfDay(filters.fromDate),
    to: isoEndOfDay(filters.toDate),
    branchId: filters.branchId || undefined,
    supplierId: filters.supplierId || undefined,
    inventoryItemId: filters.inventoryItemId || undefined,
    menuCategory: filters.menuCategory || undefined,
    topN: filters.topN || undefined,
  };
}

export function ExecutiveFoodOpsDashboardPage() {
  const suppliersQuery = useSuppliersQuery();
  const inventoryItemsQuery = useInventoryItemsQuery(
    { limit: 200 },
    { staleTime: 60_000 },
  );

  const suppliers = suppliersQuery.data || [];
  const inventoryItems = inventoryItemsQuery.data || [];

  const [filters, setFilters] = useState({
    fromDate: daysAgoISODate(30),
    toDate: todayISODate(),
    menuCategory: "",
    topN: 10,
    branchId: "",
    supplierId: "",
    inventoryItemId: "",
  });

  const [applied, setApplied] = useState(filters);

  const params = useMemo(() => buildParams(applied), [applied]);
  const q = useExecutiveDashboardQuery(params);
  const data = q.data;

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const insights = data?.insights || {};

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">Executive Food Ops Dashboard</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Real-time revenue, food cost, waste, menu engineering, inventory and
          supplier intelligence.
        </div>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={() => setApplied(filters)}
        isLoading={q.isLoading}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
      />

      <div className="grid gap-4 md:grid-cols-6">
        <KpiCard
          label="Food revenue"
          value={formatMoney(kpis.totalFoodRevenueCents)}
        />
        <KpiCard
          label="Ingredient cost"
          value={formatMoney(kpis.totalIngredientCostCents)}
        />
        <KpiCard
          label="Food cost %"
          value={formatPct(kpis.foodCostPercentage)}
        />
        <KpiCard
          label="Gross profit"
          value={formatMoney(kpis.grossProfitCents)}
        />
        <KpiCard
          label="Waste losses"
          value={formatMoney(kpis.wasteLossCents)}
        />
        <KpiCard
          label="Inventory value"
          value={formatMoney(kpis.inventoryValueCents)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Revenue vs Ingredient Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            {q.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <RevenueCostTrendChart
                dailyRevenue={charts.dailyRevenue}
                dailyIngredientCost={charts.dailyIngredientCost}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Menu Engineering Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {q.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <MenuCategoryPie counts={charts.menuCategoryCounts} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Profitable Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Meal</th>
                    <th className="py-2">Sales</th>
                    <th className="py-2">Revenue</th>
                    <th className="py-2">Profit</th>
                    <th className="py-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {q.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={5}>
                        Loading…
                      </td>
                    </tr>
                  ) : (insights.topProfitableMeals || []).length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={5}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    insights.topProfitableMeals.map((m) => (
                      <tr key={m.recipeId} className="border-b last:border-b-0">
                        <td className="py-2 font-medium">{m.name}</td>
                        <td className="py-2">{toNumber(m.totalSalesCount)}</td>
                        <td className="py-2">
                          {formatMoney(m.totalRevenueCents)}
                        </td>
                        <td className="py-2">
                          {formatMoney(m.totalProfitCents)}
                        </td>
                        <td className="py-2">{m.engineeringCategory}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Waste: Most Wasted Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Ingredient</th>
                    <th className="py-2">Waste cost</th>
                    <th className="py-2">Qty (base)</th>
                  </tr>
                </thead>
                <tbody>
                  {q.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        Loading…
                      </td>
                    </tr>
                  ) : (insights.mostWastedIngredients || []).length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    insights.mostWastedIngredients.map((x) => (
                      <tr
                        key={x.inventoryItemId}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 font-medium">{x.name}</td>
                        <td className="py-2">
                          {formatMoney(x.totalWasteCostCents)}
                        </td>
                        <td className="py-2">
                          {toNumber(
                            x.totalWasteQuantityBaseUnit,
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {x.baseUnitSymbol}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Inventory Forecast (Days Remaining)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Item</th>
                    <th className="py-2">In stock</th>
                    <th className="py-2">Avg/day</th>
                    <th className="py-2">Days left</th>
                  </tr>
                </thead>
                <tbody>
                  {q.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={4}>
                        Loading…
                      </td>
                    </tr>
                  ) : (insights.lowStockForecast || []).length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={4}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    insights.lowStockForecast.map((i) => (
                      <tr
                        key={i.inventoryItemId}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 font-medium">{i.name}</td>
                        <td className="py-2">
                          {toNumber(i.quantityInStock).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          {i.baseUnitSymbol}
                        </td>
                        <td className="py-2">
                          {toNumber(i.averageDailyConsumption).toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>
                        <td className="py-2">
                          {toNumber(i.estimatedDaysRemaining).toLocaleString(
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Supplier Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2">Supplier</th>
                    <th className="py-2">Spent</th>
                    <th className="py-2">Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {q.isLoading ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        Loading…
                      </td>
                    </tr>
                  ) : (insights.supplierSpending || []).length === 0 ? (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={3}>
                        No data yet.
                      </td>
                    </tr>
                  ) : (
                    insights.supplierSpending.map((s) => (
                      <tr
                        key={s.supplierId}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-2 font-medium">{s.name}</td>
                        <td className="py-2">
                          {formatMoney(s.totalSpentCents)}
                        </td>
                        <td className="py-2">{s.purchaseCount}</td>
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
