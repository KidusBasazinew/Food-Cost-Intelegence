import { useMemo, useState } from "react";
import {
  DollarSign,
  Percent,
  Package,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { AnalyticsFilterBar } from "@/features/analytics/components/AnalyticsFilterBar";
import { useExecutiveDashboardQuery } from "@/features/analytics/hooks/useExecutiveDashboard";
import { useDemoSalesAging } from "@/features/analytics/hooks/useDemoSalesAging";
import {
  scaleMoneyByAgingFactor,
  getDemoAgingCountRatio,
} from "@/features/analytics/utils/demoSalesAging";
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
import {
  AnalyticsCard,
  ContentGrid,
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";

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

// Deterministic PRNG helpers for the demo aging sampling (local copies so the
// page does not depend on engine internals).
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
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

  // FRONTEND-ONLY demo sales aging: each sold item shows real figures for 1h
  // from its own creation, then drops into a 10% loop. The backend data is
  // never modified — sales-derived money is scaled in the democlient only.
  const aging = useDemoSalesAging();
  const f = aging.factor;

  const agedKpis = useMemo(() => {
    const revenue = scaleMoneyByAgingFactor(kpis?.totalFoodRevenueCents, f);
    const cost = scaleMoneyByAgingFactor(kpis?.totalIngredientCostCents, f);
    return {
      totalFoodRevenueCents: revenue,
      totalIngredientCostCents: cost,
      grossProfitCents: revenue - cost,
      foodCostPercentage:
        revenue > 0
          ? (cost / revenue) * 100
          : toNumber(kpis?.foodCostPercentage),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpis, f]);

  const agedCharts = useMemo(
    () => ({
      dailyRevenue: (charts?.dailyRevenue || []).map((d) => ({
        ...d,
        revenueCents: scaleMoneyByAgingFactor(d.revenueCents, f),
      })),
      dailyIngredientCost: (charts?.dailyIngredientCost || []).map((d) => ({
        ...d,
        ingredientCostCents: scaleMoneyByAgingFactor(d.ingredientCostCents, f),
      })),
      menuCategoryCounts: charts?.menuCategoryCounts,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [charts, f],
  );

  // FRONTEND-ONLY demo aging for the Top Meals table: meals stay REAL (real
  // prices, margins, sales-derived revenue) but only ~ratio of the list is
  // shown — randomly chosen, capped so the count reflects the demo reduction.
  const agedTopMeals = useMemo(() => {
    const all = insights?.topProfitableMeals || [];
    const dayBucket = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const shuffled = [...all].sort((a, b) => {
      const ra = mulberry32(
        hashSeed(`meal:${dayBucket}:${a.recipeId ?? a.name}`),
      )();
      const rb = mulberry32(
        hashSeed(`meal:${dayBucket}:${b.recipeId ?? b.name}`),
      )();
      return ra - rb;
    });
    const showCount = Math.max(
      all.length > 0 ? 1 : 0,
      Math.ceil(all.length * getDemoAgingCountRatio()),
    );
    return shuffled.slice(0, showCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights]);

  const profitableColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Meal",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "totalSalesCount",
        header: "Sales",
        cell: ({ getValue }) => toNumber(getValue()),
      },
      {
        accessorKey: "totalRevenueCents",
        header: "Revenue",
        cell: ({ getValue }) => formatMoney(getValue()),
      },
      {
        accessorKey: "totalProfitCents",
        header: "Profit",
        cell: ({ getValue }) => (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatMoney(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "engineeringCategory",
        header: "Category",
        cell: ({ getValue }) => (
          <StatusBadge status="analytics" label={getValue()} />
        ),
      },
    ],
    [],
  );

  const wasteColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Ingredient",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "totalWasteCostCents",
        header: "Waste cost",
        cell: ({ getValue }) => (
          <span className="text-rose-600 dark:text-rose-400">
            {formatMoney(getValue())}
          </span>
        ),
      },
      {
        id: "qty",
        header: "Qty (base)",
        cell: ({ row }) =>
          `${toNumber(row.original.totalWasteQuantityBaseUnit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${row.original.baseUnitSymbol}`,
      },
    ],
    [],
  );

  const forecastColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Item" },
      {
        id: "stock",
        header: "In stock",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityInStock).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${row.original.baseUnitSymbol}`,
      },
      {
        accessorKey: "averageDailyConsumption",
        header: "Avg/day",
        cell: ({ getValue }) =>
          toNumber(getValue()).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          }),
      },
      {
        accessorKey: "estimatedDaysRemaining",
        header: "Days left",
        cell: ({ getValue }) => {
          const days = toNumber(getValue());
          return (
            <StatusBadge
              status={days <= 3 ? "critical" : days <= 7 ? "warning" : "active"}
              label={days.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}
            />
          );
        },
      },
    ],
    [],
  );

  const supplierColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Supplier" },
      {
        accessorKey: "totalSpentCents",
        header: "Spent",
        cell: ({ getValue }) => formatMoney(getValue()),
      },
      { accessorKey: "purchaseCount", header: "Purchases" },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Executive Food Ops Dashboard"
        subtitle="Real-time revenue, food cost, waste, menu engineering, inventory and supplier intelligence."
      />

      <AnalyticsFilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={() => setApplied(filters)}
        isLoading={q.isLoading}
        suppliers={suppliers}
        inventoryItems={inventoryItems}
      />

      <KpiGrid cols={6}>
        <KpiCard
          label="Food revenue"
          value={formatMoney(agedKpis.totalFoodRevenueCents)}
          icon={DollarSign}
          accent="purple"
          loading={q.isLoading}
        />
        <KpiCard
          label="Ingredient cost"
          value={formatMoney(agedKpis.totalIngredientCostCents)}
          icon={TrendingDown}
          accent="amber"
          loading={q.isLoading}
        />
        <KpiCard
          label="Food cost %"
          value={formatPct(agedKpis.foodCostPercentage)}
          icon={Percent}
          accent="indigo"
          loading={q.isLoading}
        />
        <KpiCard
          label="Gross profit"
          value={formatMoney(agedKpis.grossProfitCents)}
          icon={TrendingUp}
          accent="emerald"
          loading={q.isLoading}
        />
        <KpiCard
          label="Waste losses"
          value={formatMoney(kpis.wasteLossCents)}
          icon={Trash2}
          accent="rose"
          loading={q.isLoading}
        />
        <KpiCard
          label="Inventory value"
          value={formatMoney(kpis.inventoryValueCents)}
          icon={Package}
          accent="blue"
          loading={q.isLoading}
        />
      </KpiGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Revenue vs Ingredient Cost"
          description="Daily trend comparison"
          accent="purple"
          loading={q.isLoading}
        >
          <RevenueCostTrendChart
            dailyRevenue={agedCharts.dailyRevenue}
            dailyIngredientCost={agedCharts.dailyIngredientCost}
          />
        </AnalyticsCard>

        <AnalyticsCard
          title="Menu Engineering Mix"
          description="BCG category distribution"
          accent="blue"
          loading={q.isLoading}
        >
          <MenuCategoryPie counts={charts.menuCategoryCounts} />
        </AnalyticsCard>
      </ContentGrid>

      <ContentGrid>
        <AnalyticsCard title="Top Profitable Meals" accent="emerald">
          <DataTable
            columns={profitableColumns}
            data={agedTopMeals}
            loading={q.isLoading}
            enableSearch={false}
            pageSize={8}
            emptyTitle="No profitable meals yet"
          />
        </AnalyticsCard>

        <AnalyticsCard title="Most Wasted Ingredients" accent="rose">
          <DataTable
            columns={wasteColumns}
            data={insights.mostWastedIngredients || []}
            loading={q.isLoading}
            enableSearch={false}
            pageSize={8}
            emptyTitle="No waste data yet"
          />
        </AnalyticsCard>
      </ContentGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Inventory Forecast"
          description="Days remaining at current consumption"
          accent="cyan"
        >
          <DataTable
            columns={forecastColumns}
            data={insights.lowStockForecast || []}
            loading={q.isLoading}
            enableSearch={false}
            pageSize={8}
            emptyTitle="No forecast data yet"
          />
        </AnalyticsCard>

        <AnalyticsCard title="Supplier Spending" accent="amber">
          <DataTable
            columns={supplierColumns}
            data={insights.supplierSpending || []}
            loading={q.isLoading}
            enableSearch={false}
            pageSize={8}
            emptyTitle="No supplier spending yet"
          />
        </AnalyticsCard>
      </ContentGrid>
    </PageShell>
  );
}
