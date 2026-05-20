import { Link } from "react-router-dom";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  AnalyticsCard,
  CHART_COLORS,
  ChartTooltip,
  ChartWrapper,
  ContentGrid,
  InsightPanel,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { usePurchasesQuery } from "@/features/inventory/hooks/usePurchases";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyFromCents(cents) {
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function InventoryDashboardPage() {
  const itemsQuery = useInventoryItemsQuery();
  const from = startOfDay(addDays(new Date(), -29)).toISOString();
  const to = new Date().toISOString();
  const purchasesQuery = usePurchasesQuery({ from, to });

  const items = itemsQuery.data || [];
  const purchases = purchasesQuery.data || [];

  const lowStockCount = items.filter((i) => {
    const min = toNumber(i.minimumStockLevel);
    const stock = toNumber(i.quantityInStock);
    return min > 0 && stock <= min;
  }).length;

  const inventoryValueCents = items.reduce((acc, i) => {
    const qty = toNumber(i.quantityInStock);
    const avg = toNumber(i.averageCostPerBaseUnitCents);
    return acc + qty * avg;
  }, 0);

  const purchasesTotalCents = purchases
    .filter((p) => p.status === "RECEIVED")
    .reduce((acc, p) => acc + toNumber(p.totalCents), 0);

  const categoryData = Object.values(
    items.reduce((acc, i) => {
      const key = i.category || "OTHER";
      if (!acc[key]) acc[key] = { category: key, valueCents: 0 };
      const qty = toNumber(i.quantityInStock);
      const avg = toNumber(i.averageCostPerBaseUnitCents);
      acc[key].valueCents += qty * avg;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.valueCents - a.valueCents)
    .slice(0, 8)
    .map((d) => ({
      ...d,
      value: Number((d.valueCents / 100).toFixed(2)),
    }));

  const dailySpend = (() => {
    const map = new Map();
    for (let i = 0; i < 30; i += 1) {
      const day = startOfDay(addDays(new Date(), -29 + i));
      map.set(day.toISOString().slice(0, 10), {
        day: day.toISOString().slice(5, 10),
        spend: 0,
      });
    }
    for (const p of purchases) {
      if (p.status !== "RECEIVED") continue;
      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      if (!createdAt) continue;
      const key = startOfDay(createdAt).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (!bucket) continue;
      bucket.spend += toNumber(p.totalCents) / 100;
    }
    return Array.from(map.values());
  })();

  const mostPurchasedItems = (() => {
    const map = new Map();
    for (const p of purchases) {
      if (!Array.isArray(p.items)) continue;
      for (const line of p.items) {
        const name = line.inventoryItem?.name || "Unknown";
        const total = toNumber(line.totalCostCents);
        map.set(name, (map.get(name) || 0) + total);
      }
    }
    return Array.from(map.entries())
      .map(([name, totalCents]) => ({
        name,
        total: Number((totalCents / 100).toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  })();

  const isLoading = itemsQuery.isLoading || purchasesQuery.isLoading;

  return (
    <PageShell>
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Live stock valuation, purchase spend, and low-stock signals."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/inventory/items">Items</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/transactions">Transactions</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/purchases">Purchases</Link>
            </Button>
          </>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Inventory value"
          value={isLoading ? "…" : formatMoneyFromCents(inventoryValueCents)}
          hint="Weighted average cost"
          icon={Package}
          accent="blue"
          loading={isLoading}
        />
        <KpiCard
          label="Low stock alerts"
          value={isLoading ? "…" : lowStockCount}
          hint="At or below minimum"
          icon={AlertTriangle}
          accent="amber"
          loading={isLoading}
        />
        <KpiCard
          label="Purchases (30d)"
          value={isLoading ? "…" : formatMoneyFromCents(purchasesTotalCents)}
          hint="Received only"
          icon={ShoppingCart}
          accent="purple"
          loading={isLoading}
        />
      </KpiGrid>

      {lowStockCount > 0 ? (
        <InsightPanel variant="warning" title="Stock attention needed">
          {lowStockCount} item{lowStockCount !== 1 ? "s" : ""} need replenishment.{" "}
          <Link to="/inventory/low-stock" className="font-medium text-primary hover:underline">
            View low stock alerts →
          </Link>
        </InsightPanel>
      ) : null}

      <ContentGrid>
        <AnalyticsCard title="Spend trend" description="Last 30 days" accent="cyan" loading={isLoading}>
          <ChartWrapper empty={dailySpend.every((d) => d.spend === 0)} height={288}>
            <AreaChart data={dailySpend} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => [
                      Number(v).toLocaleString(undefined, { style: "currency", currency: "USD" }),
                      "Spend",
                    ]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke={CHART_COLORS.cyan}
                fill="url(#spendGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartWrapper>
        </AnalyticsCard>

        <AnalyticsCard
          title="Value by category"
          description="Top 8 categories"
          accent="indigo"
          loading={isLoading}
        >
          <ChartWrapper empty={categoryData.length === 0} height={288}>
            <BarChart data={categoryData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} height={48} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => [
                      Number(v).toLocaleString(undefined, { style: "currency", currency: "USD" }),
                      "Value",
                    ]}
                  />
                }
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartWrapper>
        </AnalyticsCard>
      </ContentGrid>

      <AnalyticsCard
        title="Most purchased items"
        description="Last 30 days by spend"
        accent="emerald"
      >
        {mostPurchasedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchase lines yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mostPurchasedItems.map((row, i) => (
              <div
                key={row.name}
                className="rounded-xl border bg-gradient-to-br from-muted/30 to-transparent p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{row.name}</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500 opacity-70" />
                </div>
                <p className="mt-2 text-lg font-bold">
                  {row.total.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
                <div
                  className="mt-2 h-1 rounded-full"
                  style={{
                    width: `${Math.max(20, 100 - i * 10)}%`,
                    background: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </AnalyticsCard>
    </PageShell>
  );
}
