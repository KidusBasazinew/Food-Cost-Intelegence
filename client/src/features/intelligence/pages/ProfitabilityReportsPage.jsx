import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

import {
  AnalyticsCard,
  DataTable,
  InsightPanel,
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
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function ProfitabilityReportsPage() {
  const reportQuery = useFoodCostReportQuery({ status: "ACTIVE" });
  const recipes = reportQuery.data || [];

  const sorted = useMemo(
    () =>
      [...recipes].sort(
        (a, b) =>
          toNumber(b.estimatedProfitMargin) - toNumber(a.estimatedProfitMargin),
      ),
    [recipes],
  );

  const profitable = sorted.filter(
    (r) => toNumber(r.estimatedProfitCents) >= 0,
  );
  const lossMaking = sorted.filter((r) => toNumber(r.estimatedProfitCents) < 0);
  const lowMargin = sorted.filter(
    (r) =>
      toNumber(r.estimatedProfitCents) >= 0 &&
      toNumber(r.estimatedProfitMargin) < 15,
  );

  const columns = useMemo(
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
        id: "profit",
        header: "Profit / yield",
        cell: ({ row }) => {
          const loss = toNumber(row.original.profitPerYieldUnit) < 0;
          return (
            <span
              className={
                loss
                  ? "font-medium text-rose-600 dark:text-rose-400"
                  : "font-medium text-emerald-600 dark:text-emerald-400"
              }
            >
              {formatMoney(row.original.profitPerYieldUnit)}
            </span>
          );
        },
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
          const margin = toNumber(row.original.estimatedProfitMargin);
          const loss = toNumber(row.original.profitPerYieldUnit) < 0;
          return (
            <StatusBadge
              status={loss ? "loss" : margin < 10 ? "warning" : "profitable"}
              label={`${margin.toFixed(1)}%`}
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
        title="Profitability Reports"
        subtitle="Most profitable meals, low margin items, and loss-making menu entries."
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Profitable items"
          value={profitable.length}
          icon={TrendingUp}
          accent="emerald"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Low margin (<15%)"
          value={lowMargin.length}
          accent="amber"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Loss-making"
          value={lossMaking.length}
          accent="rose"
          loading={reportQuery.isLoading}
        />
      </KpiGrid>

      {lossMaking.length > 0 ? (
        <InsightPanel variant="critical" title="Menu engineering alert">
          {lossMaking.length} recipe{lossMaking.length !== 1 ? "s are" : " is"}{" "}
          selling below cost. Review pricing or ingredient costs immediately.
        </InsightPanel>
      ) : null}

      <AnalyticsCard
        title="Full profitability ranking"
        description="Sorted by margin — highest first"
        accent="purple"
      >
        <DataTable
          columns={columns}
          data={sorted}
          loading={reportQuery.isLoading}
          searchPlaceholder="Search recipes…"
          emptyTitle="No profitability data yet"
          emptyDescription="Create active recipes with ingredients to see margins."
        />
      </AnalyticsCard>
    </PageShell>
  );
}
