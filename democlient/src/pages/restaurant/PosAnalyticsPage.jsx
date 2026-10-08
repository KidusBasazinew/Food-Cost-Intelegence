import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, Percent, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { posService } from "@/services/pos.service";
import { toNumber } from "@/features/analytics/utils/numbers";
import {
  applyDemoAgingToOrderRows,
  isSoldOrder,
  getSoldAtMs,
} from "@/features/analytics/utils/demoSalesAging";
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
  const [todayRows, setTodayRows] = useState([]);
  const [loading, setLoading] = useState(true);
  // Re-render tick so sold items crossing their 1h boundary flip live.
  const [agingTick, setAgingTick] = useState(0);

  async function load() {
    setLoading(true);
    try {
      // Real aggregate KPIs from the backend (untouched) …
      const res = await posService.todayAnalytics();
      setData(res);
      // … plus today's order rows, fetched ONLY in the democlient frontend to
      // derive the per-item 1h aging split (fresh vs 10% loop).
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      try {
        const rows = await posService.listOrders({
          page: 1,
          limit: 100,
          from: startOfToday.toISOString(),
          to: endOfToday.toISOString(),
        });
        setTodayRows(rows?.rows ?? []);
      } catch {
        setTodayRows([]);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load POS analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => setAgingTick((t) => t + 1), 30_000);
    return () => clearInterval(ticker);
  }, []);

  // FRONTEND-ONLY demo aging: compute fresh (< 1h) vs aged (sampled) split
  // from today's sold orders. Backend KPIs are never modified; the split drives
  // a count-based display factor (fresh × 100% + sampled aged rows).
  const aging = useMemo(() => {
    const sold = (todayRows || []).filter(
      (r) => isSoldOrder(r) && getSoldAtMs(r) != null,
    );
    const result = applyDemoAgingToOrderRows(sold, Date.now());
    const realRevenue = result.realRevenueCents;
    const displayRevenue = result.displayRevenueCents;
    const ratio = realRevenue > 0 ? displayRevenue / realRevenue : 1;
    return {
      freshCount: result.freshCount,
      agedCount: result.agedCount,
      sampledCount: result.sampledCount,
      displayRevenue,
      ratio,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRows, agingTick]);

  // Display values: fresh portion real, aged portion at 10% of real totals.
  const displayRevenueCents =
    aging.ratio < 1 && data
      ? toNumber(data.revenueCents) * aging.ratio
      : toNumber(data?.revenueCents);
  const displayCogsCents =
    aging.ratio < 1 && data
      ? toNumber(data.ingredientCostCents) * aging.ratio
      : toNumber(data?.ingredientCostCents);
  const displayGrossProfitCents = displayRevenueCents - displayCogsCents;
  const displayOrdersCount =
    aging.freshCount + aging.agedCount > 0
      ? aging.freshCount + aging.sampledCount
      : toNumber(data?.ordersCount ?? 0);

  // Structural preparation for auxiliary data insight breakdown logs
  const performanceBreakdown = useMemo(() => {
    if (!data) return [];
    return [
      {
        metric: "POS Revenue Metrics",
        value: formatETB(displayRevenueCents),
        context: `${displayOrdersCount} orders displayed (demo 1h aging applied)`,
      },
      {
        metric: "Cost of Goods Sold (COGS)",
        value: formatETB(displayCogsCents),
        context: "Inventory Consumption (source: ORDER)",
      },
      {
        metric: "Calculated Operations Margin",
        value: formatETB(displayGrossProfitCents),
        context: "Gross Revenue minus Ingredient Cost Base",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    displayRevenueCents,
    displayCogsCents,
    displayGrossProfitCents,
    displayOrdersCount,
  ]);

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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={load}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Analytics
            </Button>
          </div>
        }
      />

      {/* Structured KPI Row aligning with Executive Standard */}
      <KpiGrid cols={3}>
        <KpiCard
          label="Today's Sales"
          value={formatETB(displayRevenueCents)}
          description={`Orders volume: ${displayOrdersCount}`}
          icon={DollarSign}
          accent="purple"
          loading={loading}
        />
        <KpiCard
          label="Today's COGS"
          value={formatETB(displayCogsCents)}
          description="Source: InventoryConsumption (ORDER)"
          icon={Percent}
          accent="amber"
          loading={loading}
        />
        <KpiCard
          label="Gross Profit"
          value={formatETB(displayGrossProfitCents)}
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
