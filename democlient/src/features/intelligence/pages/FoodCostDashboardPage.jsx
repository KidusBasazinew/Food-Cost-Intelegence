import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  Percent,
  TrendingDown,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AnalyticsCard,
  CHART_COLORS,
  ChartTooltip,
  ChartWrapper,
  ContentGrid,
  DataTable,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";
import { useFoodCostReportQuery } from "@/features/intelligence/hooks/useFoodCost";

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

export function FoodCostDashboardPage() {
  const reportQuery = useFoodCostReportQuery({ status: "ACTIVE" });
  const recipes = reportQuery.data || [];

  const kpis = useMemo(() => {
    const avgCostPerYield = recipes.length
      ? recipes.reduce((acc, r) => acc + toNumber(r.costPerYieldUnit), 0) /
        recipes.length
      : 0;
    const avgSelling = recipes.length
      ? recipes.reduce((acc, r) => acc + toNumber(r.sellingPriceCents), 0) /
        recipes.length
      : 0;
    const avgFoodCost = recipes.length
      ? recipes.reduce((acc, r) => acc + toNumber(r.foodCostPercentage), 0) /
        recipes.length
      : 0;
    const avgMargin = recipes.length
      ? recipes.reduce((acc, r) => acc + toNumber(r.estimatedProfitMargin), 0) /
        recipes.length
      : 0;

    return {
      count: recipes.length,
      avgCostPerYield,
      avgSelling,
      avgFoodCost,
      avgMargin,
    };
  }, [recipes]);

  const topMargin = useMemo(
    () =>
      [...recipes]
        .sort(
          (a, b) =>
            toNumber(b.estimatedProfitMargin) -
            toNumber(a.estimatedProfitMargin),
        )
        .slice(0, 8)
        .map((r) => ({
          name: r.name.length > 18 ? `${r.name.slice(0, 18)}…` : r.name,
          margin: toNumber(r.estimatedProfitMargin),
        })),
    [recipes],
  );

  const lowMargin = useMemo(
    () =>
      [...recipes]
        .sort(
          (a, b) =>
            toNumber(a.estimatedProfitMargin) -
            toNumber(b.estimatedProfitMargin),
        )
        .slice(0, 8),
    [recipes],
  );

  const lowMarginColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Recipe",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      },
      {
        id: "cost",
        header: "Cost / yield",
        cell: ({ row }) => formatMoney(row.original.costPerYieldUnit),
      },
      {
        id: "selling",
        header: "Selling",
        cell: ({ row }) => formatMoney(row.original.sellingPriceCents),
      },
      {
        id: "foodCost",
        header: "Food cost %",
        cell: ({ row }) =>
          `${toNumber(row.original.foodCostPercentage).toFixed(1)}%`,
      },
      {
        id: "margin",
        header: "Margin",
        cell: ({ row }) => {
          const m = toNumber(row.original.estimatedProfitMargin);
          return (
            <StatusBadge
              status={m < 10 ? "warning" : m < 0 ? "loss" : "profitable"}
              label={`${m.toFixed(1)}%`}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Food Cost Dashboard"
        subtitle="Menu-level cost, profit, and margin intelligence across active recipes."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/recipes">Manage recipes</Link>
          </Button>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard
          label="Active recipes"
          value={kpis.count}
          icon={UtensilsCrossed}
          accent="purple"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Avg cost / yield"
          value={formatMoney(kpis.avgCostPerYield)}
          icon={TrendingDown}
          accent="amber"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Avg selling"
          value={formatMoney(kpis.avgSelling)}
          icon={DollarSign}
          accent="blue"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Avg food cost %"
          value={`${kpis.avgFoodCost.toFixed(1)}%`}
          icon={Percent}
          accent="emerald"
          loading={reportQuery.isLoading}
        />
      </KpiGrid>

      <ContentGrid>
        <AnalyticsCard
          title="Top profit margin"
          description="Highest margin meals"
          accent="emerald"
          loading={reportQuery.isLoading}
        >
          <ChartWrapper empty={topMargin.length === 0} height={300}>
            <BarChart data={topMargin} margin={{ left: 8, right: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                height={48}
              />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => [`${Number(v).toFixed(2)}%`, "Margin"]}
                  />
                }
              />
              <Bar dataKey="margin" radius={[6, 6, 0, 0]}>
                {topMargin.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS.success} />
                ))}
              </Bar>
            </BarChart>
          </ChartWrapper>
        </AnalyticsCard>

        <AnalyticsCard title="Low margin meals" accent="rose">
          <DataTable
            columns={lowMarginColumns}
            data={lowMargin}
            loading={reportQuery.isLoading}
            enableSearch={false}
            pageSize={8}
            emptyTitle="No recipes yet"
          />
        </AnalyticsCard>
      </ContentGrid>
    </PageShell>
  );
}
