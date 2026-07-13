import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, Percent, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { posService } from "@/services/pos.service";
import { toNumber } from "@/features/analytics/utils/numbers";
import {
  PageShell,
  PageHeader,
  KpiGrid,
  KpiCard,
  ContentGrid,
  AnalyticsCard,
  DataTable,
} from "@/components/ui/erp";

// Utility formatting matching analytics utilities file patterns
function formatETB(cents) {
  const n = Number(cents ?? 0);
  if (!Number.isFinite(n)) return "ETB 0.00";
  return `ETB ${(n / 100).toFixed(2)}`;
}

export function PosAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await posService.todayAnalytics();
      setData(res);
    } catch (err) {
      toast.error(err?.message || "Failed to load POS analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Structural preparation for auxiliary data insight breakdown logs
  const performanceBreakdown = useMemo(() => {
    if (!data) return [];
    return [
      {
        metric: "POS Revenue Metrics",
        value: formatETB(data?.revenueCents),
        context: `${toNumber(data?.ordersCount ?? 0)} orders completed`,
      },
      {
        metric: "Cost of Goods Sold (COGS)",
        value: formatETB(data?.ingredientCostCents),
        context: "Inventory Consumption (source: ORDER)",
      },
      {
        metric: "Calculated Operations Margin",
        value: formatETB(data?.grossProfitCents),
        context: "Gross Revenue minus Ingredient Cost Base",
      },
    ];
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "metric",
        header: "Operational Vector",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.metric}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Current Value (ETB)",
        cell: ({ row, getValue }) => {
          const isProfit = row.original.metric.includes("Margin");
          return (
            <span
              className={
                isProfit
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "font-medium"
              }
            >
              {getValue()}
            </span>
          );
        },
      },
      {
        accessorKey: "context",
        header: "Data Source / Audit Rule",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-xs">{getValue()}</span>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      {/* Structural Page Header Context */}
      <PageHeader
        title="POS Analytics (Today)"
        subtitle="Real-time key performance indicators calculated directly from point-of-sale activities and ingredient consumption."
        action={
          <Button
            variant="secondary"
            onClick={load}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Analytics
          </Button>
        }
      />

      {/* Structured KPI Row aligning with Executive Standard */}
      <KpiGrid cols={3}>
        <KpiCard
          label="Today's Sales"
          value={formatETB(data?.revenueCents)}
          description={`Orders volume: ${toNumber(data?.ordersCount ?? 0)}`}
          icon={DollarSign}
          accent="purple"
          loading={loading}
        />
        <KpiCard
          label="Today's COGS"
          value={formatETB(data?.ingredientCostCents)}
          description="Source: InventoryConsumption (ORDER)"
          icon={Percent}
          accent="amber"
          loading={loading}
        />
        <KpiCard
          label="Gross Profit"
          value={formatETB(data?.grossProfitCents)}
          description="Formula: Revenue − COGS"
          icon={TrendingUp}
          accent="emerald"
          loading={loading}
        />
      </KpiGrid>

      {/* Main Insights Grid Layout */}
      <div className="mt-2">
        <ContentGrid cols={1}>
          <AnalyticsCard
            title="Real-Time Ledger Summary"
            description="Operational audit details for point of sale revenue streams vs warehouse utilization targets."
            accent="purple"
          >
            <DataTable
              columns={columns}
              data={performanceBreakdown}
              loading={loading}
              enableSearch={false}
              pageSize={5}
              emptyTitle="No analytical metrics synthesized for this branch cycle"
            />
          </AnalyticsCard>
        </ContentGrid>
      </div>
    </PageShell>
  );
}
