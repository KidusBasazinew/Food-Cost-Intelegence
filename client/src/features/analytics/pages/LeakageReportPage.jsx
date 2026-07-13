import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  FileDown,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AnalyticsCard,
  CHART_COLORS,
  ChartTooltip,
  ChartWrapper,
  DataTable,
  InsightPanel,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLeakageDashboardQuery } from "@/features/analytics/hooks/useLeakage";
import { reportsApi } from "@/features/analytics/api/reportsApi";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
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

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function fmtQty(qty, symbol) {
  const n = toNumber(qty);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}${symbol ? ` ${symbol}` : ""}`;
}

export function LeakageReportPage() {
  const [fromDate, setFromDate] = useState(daysAgoISODate(30));
  const [toDate, setToDate] = useState(todayISODate());
  const [busyExport, setBusyExport] = useState(false);

  const params = useMemo(
    () => ({ from: isoStartOfDay(fromDate), to: isoEndOfDay(toDate) }),
    [fromDate, toDate],
  );

  const dashboardQuery = useLeakageDashboardQuery(params);
  const data = dashboardQuery.data;

  const criticalNotifs = useNotifications({
    filters: { type: "WASTE_ALERT", severity: "CRITICAL" },
    refetchInterval: 30000,
  });

  const notifFeed = useNotifications({
    filters: { type: "WASTE_ALERT" },
    refetchInterval: 30000,
  });

  async function onExport(format) {
    setBusyExport(true);
    try {
      const blob = await reportsApi.export({
        type: "LEAKAGE",
        format,
        params,
      });
      downloadBlob(blob, `LEAKAGE.${format}`);
    } finally {
      setBusyExport(false);
    }
  }

  const kpis = data?.kpis;
  const loss = data?.loss;
  const score = data?.score;

  const scoreAccent =
    score?.color === "green"
      ? "emerald"
      : score?.color === "yellow"
        ? "amber"
        : "rose";

  const topLost = (data?.charts?.topLostProducts || []).map((r) => ({
    name: r.name,
    lostValueCents: toNumber(r.lostValueCents),
  }));

  const varianceTrend = (data?.charts?.varianceTrend || []).map((r) => ({
    day: r.day,
    missingValueCents: toNumber(r.missingValueCents),
    excessValueCents: toNumber(r.excessValueCents),
  }));

  const wasteTrend = (data?.charts?.wasteTrend || []).map((r) => ({
    day: r.day,
    wasteCostCents: toNumber(r.wasteCostCents),
  }));

  const varianceColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      },
      {
        id: "system",
        header: "System",
        cell: ({ row }) =>
          fmtQty(row.original.systemQuantity, row.original.baseUnitSymbol),
      },
      {
        id: "physical",
        header: "Physical",
        cell: ({ row }) =>
          fmtQty(row.original.physicalQuantity, row.original.baseUnitSymbol),
      },
      {
        id: "variance",
        header: "Variance",
        cell: ({ row }) => {
          const v = toNumber(row.original.varianceQuantity);
          const label = fmtQty(v, row.original.baseUnitSymbol);
          const cls = row.original.classification;
          const tone =
            cls === "CRITICAL"
              ? "text-rose-600 dark:text-rose-400"
              : cls === "WARNING"
                ? "text-amber-600 dark:text-amber-400"
                : cls === "WATCH"
                  ? "text-cyan-700 dark:text-cyan-300"
                  : "text-muted-foreground";
          return <span className={`font-medium ${tone}`}>{label}</span>;
        },
      },
      {
        id: "pct",
        header: "Variance %",
        cell: ({ row }) => {
          const pct = toNumber(row.original.variancePercentage);
          return <span className="font-medium">{formatPct(pct)}</span>;
        },
      },
      {
        id: "loss",
        header: "Loss value",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatMoney(toNumber(row.original.lossValueCents))}
          </span>
        ),
      },
    ],
    [],
  );

  const stockCountsColumns = useMemo(
    () => [
      { accessorKey: "countedAt", header: "Counted at" },
      { accessorKey: "status", header: "Status" },
      {
        id: "items",
        header: "Items",
        cell: ({ row }) => row.original?._count?.items ?? 0,
      },
    ],
    [],
  );

  const criticalRows =
    criticalNotifs.query.data?.pages?.flatMap((p) => p.items || []) || [];
  const feedRows =
    notifFeed.query.data?.pages?.flatMap((p) => p.items || []) || [];

  return (
    <PageShell>
      <PageHeader
        title="Inventory Leakage Report"
        subtitle="Variance intelligence, missing stock signals, and estimated loss value."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={busyExport}
              onClick={() => onExport("csv")}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={busyExport}
              onClick={() => onExport("pdf")}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              From
            </div>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">To</div>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <InsightPanel variant="warning" title="How this works">
        Variance is calculated when a stock count is completed: physical
        quantity minus system quantity. Alerts trigger automatically when
        absolute variance exceeds 7%.
      </InsightPanel>

      <KpiGrid cols={3}>
        <KpiCard
          label="Total Variance Value"
          value={
            dashboardQuery.isLoading
              ? "…"
              : formatMoney(toNumber(kpis?.totalVarianceValueCents))
          }
          hint="Abs(variance) × avg cost"
          icon={BarChart3}
          accent="purple"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Total Missing Stock"
          value={
            dashboardQuery.isLoading ? "…" : fmtQty(kpis?.totalMissingStock, "")
          }
          hint="Negative variance only"
          icon={AlertTriangle}
          accent="rose"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Total Excess Stock"
          value={
            dashboardQuery.isLoading ? "…" : fmtQty(kpis?.totalExcessStock, "")
          }
          hint="Positive variance only"
          icon={ShieldCheck}
          accent="emerald"
          loading={dashboardQuery.isLoading}
        />
      </KpiGrid>

      <KpiGrid cols={3}>
        <KpiCard
          label="High Risk Items"
          value={dashboardQuery.isLoading ? "…" : toNumber(kpis?.highRiskItems)}
          hint="WARNING + CRITICAL"
          icon={ShieldAlert}
          accent="amber"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Critical Variance Items"
          value={
            dashboardQuery.isLoading
              ? "…"
              : toNumber(kpis?.criticalVarianceItems)
          }
          hint=">= 15% variance"
          icon={ShieldAlert}
          accent="rose"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Inventory Accuracy %"
          value={
            dashboardQuery.isLoading
              ? "…"
              : formatPct(kpis?.inventoryAccuracyPercent)
          }
          hint="100 - (abs(variance)/stock)*100"
          icon={ShieldCheck}
          accent="cyan"
          loading={dashboardQuery.isLoading}
        />
      </KpiGrid>

      <KpiGrid cols={3}>
        <KpiCard
          label="Estimated Loss Today"
          value={
            dashboardQuery.isLoading
              ? "…"
              : formatMoney(toNumber(loss?.estimatedLossTodayCents))
          }
          hint="From stock count variances"
          icon={BarChart3}
          accent="rose"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Estimated Loss This Month"
          value={
            dashboardQuery.isLoading
              ? "…"
              : formatMoney(toNumber(loss?.estimatedLossThisMonthCents))
          }
          hint="From stock count variances"
          icon={BarChart3}
          accent="amber"
          loading={dashboardQuery.isLoading}
        />
        <KpiCard
          label="Estimated Loss This Year"
          value={
            dashboardQuery.isLoading
              ? "…"
              : formatMoney(toNumber(loss?.estimatedLossThisYearCents))
          }
          hint="From stock count variances"
          icon={BarChart3}
          accent="purple"
          loading={dashboardQuery.isLoading}
        />
      </KpiGrid>

      <KpiGrid cols={3}>
        <KpiCard
          label="Inventory Integrity Score"
          value={
            dashboardQuery.isLoading
              ? "…"
              : `${toNumber(score?.inventoryIntegrityScore)}/100`
          }
          hint="Penalizes WATCH/WARNING/CRITICAL"
          icon={ShieldCheck}
          accent={scoreAccent}
          loading={dashboardQuery.isLoading}
        />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsCard
          title="Top 10 Lost Products"
          description="By estimated loss value"
          accent="rose"
          loading={dashboardQuery.isLoading}
        >
          <ChartWrapper empty={topLost.length === 0} height={320}>
            <BarChart data={topLost} margin={{ left: 12, right: 12 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} hide />
              <YAxis
                tickFormatter={(v) => formatMoney(v)}
                tick={{ fontSize: 11 }}
                width={72}
              />
              <Tooltip
                content={
                  <ChartTooltip formatter={(v) => [formatMoney(v), "Loss"]} />
                }
              />
              <Bar
                dataKey="lostValueCents"
                fill={CHART_COLORS.danger}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartWrapper>
        </AnalyticsCard>

        <AnalyticsCard
          title="Variance Trend"
          description="Missing vs excess value"
          accent="cyan"
          loading={dashboardQuery.isLoading}
        >
          <ChartWrapper empty={varianceTrend.length === 0} height={320}>
            <AreaChart
              data={varianceTrend}
              margin={{ left: 12, right: 12, top: 8 }}
            >
              <defs>
                <linearGradient id="missingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.danger}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.danger}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatMoney(v)}
                tick={{ fontSize: 11 }}
                width={72}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v, name) => [
                      formatMoney(v),
                      name === "missingValueCents" ? "Missing" : "Excess",
                    ]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="missingValueCents"
                stroke={CHART_COLORS.danger}
                fill="url(#missingGrad)"
                strokeWidth={2}
                dot={false}
                name="missingValueCents"
              />
              <Line
                type="monotone"
                dataKey="excessValueCents"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={false}
                name="excessValueCents"
              />
            </AreaChart>
          </ChartWrapper>
        </AnalyticsCard>
      </div>

      <AnalyticsCard
        title="Waste Trend"
        description="Manual waste cost"
        accent="amber"
        loading={dashboardQuery.isLoading}
      >
        <ChartWrapper empty={wasteTrend.length === 0} height={280}>
          <AreaChart data={wasteTrend} margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => formatMoney(v)}
              tick={{ fontSize: 11 }}
              width={72}
            />
            <Tooltip
              content={
                <ChartTooltip formatter={(v) => [formatMoney(v), "Waste"]} />
              }
            />
            <Area
              type="monotone"
              dataKey="wasteCostCents"
              stroke={CHART_COLORS.warning}
              fill={CHART_COLORS.warning}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
              name="wasteCostCents"
            />
          </AreaChart>
        </ChartWrapper>
      </AnalyticsCard>

      <AnalyticsCard
        title="Critical Alerts"
        description="Latest CRITICAL variance notifications"
        accent="rose"
        loading={criticalNotifs.query.isLoading}
      >
        <DataTable
          columns={[
            { accessorKey: "createdAt", header: "Time" },
            { accessorKey: "title", header: "Alert" },
            { accessorKey: "message", header: "Details" },
          ]}
          data={criticalRows.slice(0, 20)}
          loading={criticalNotifs.query.isLoading}
          enableSearch={false}
          pageSize={8}
          emptyTitle="No critical alerts"
          emptyDescription="No CRITICAL variance notifications in this feed."
        />
      </AnalyticsCard>

      <AnalyticsCard
        title="Variance Table"
        description="Most risky items first"
        accent="purple"
        loading={dashboardQuery.isLoading}
      >
        <DataTable
          columns={varianceColumns}
          data={data?.tables?.varianceTable || []}
          loading={dashboardQuery.isLoading}
          enableSearch={true}
          pageSize={12}
          emptyTitle="No stock counts yet"
          emptyDescription="Complete a stock count to start variance tracking."
        />
      </AnalyticsCard>

      <AnalyticsCard
        title="Recent Stock Counts"
        description="Latest completed counts"
        accent="cyan"
        loading={dashboardQuery.isLoading}
      >
        <DataTable
          columns={stockCountsColumns}
          data={data?.latestStockCounts || []}
          loading={dashboardQuery.isLoading}
          enableSearch={false}
          pageSize={8}
          emptyTitle="No stock counts"
          emptyDescription="Create and complete a stock count to populate this list."
        />
      </AnalyticsCard>

      <AnalyticsCard
        title="Notification Feed"
        description="Latest leakage-related alerts"
        accent="amber"
        loading={notifFeed.query.isLoading}
      >
        <DataTable
          columns={[
            { accessorKey: "createdAt", header: "Time" },
            { accessorKey: "severity", header: "Severity" },
            { accessorKey: "title", header: "Title" },
          ]}
          data={feedRows.slice(0, 30)}
          loading={notifFeed.query.isLoading}
          enableSearch={false}
          pageSize={10}
          emptyTitle="No notifications"
          emptyDescription="No WASTE_ALERT notifications yet."
        />
      </AnalyticsCard>
    </PageShell>
  );
}
