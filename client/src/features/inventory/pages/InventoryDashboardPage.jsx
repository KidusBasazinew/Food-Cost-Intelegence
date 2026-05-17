import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { usePurchasesQuery } from "@/features/inventory/hooks/usePurchases";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyFromCents(cents) {
  const dollars = toNumber(cents) / 100;
  return dollars.toLocaleString(undefined, {
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Inventory Dashboard</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Live stock, purchases, and cost signals.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/inventory/items">Items</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/inventory/transactions">Transactions</Link>
          </Button>
          <Button asChild>
            <Link to="/purchases">Purchases</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? "…" : formatMoneyFromCents(inventoryValueCents)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Estimated using weighted average cost.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? "…" : lowStockCount}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Items at or below minimum stock.
            </div>
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link to="/inventory/low-stock">View low stock</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Purchases (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoading ? "…" : formatMoneyFromCents(purchasesTotalCents)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Received purchases only.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Spend Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailySpend}
                margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spend"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Inventory Value by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  height={50}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Most Purchased Items (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {mostPurchasedItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No purchase lines yet.
              </div>
            ) : (
              mostPurchasedItems.map((row) => (
                <div key={row.name} className="rounded-lg border bg-card p-3">
                  <div className="text-sm font-medium">{row.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {row.total.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
