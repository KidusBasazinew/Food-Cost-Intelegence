import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toNumber, formatMoney } from "@/features/analytics/utils/numbers";

export function RevenueCostTrendChart({
  dailyRevenue = [],
  dailyIngredientCost = [],
}) {
  const map = new Map();
  for (const r of dailyRevenue) {
    map.set(r.day, { day: r.day, revenueCents: toNumber(r.revenueCents) });
  }
  for (const c of dailyIngredientCost) {
    const prev = map.get(c.day) || { day: c.day, revenueCents: 0 };
    map.set(c.day, {
      ...prev,
      ingredientCostCents: toNumber(c.ingredientCostCents),
    });
  }
  const data = Array.from(map.values()).sort((a, b) =>
    a.day.localeCompare(b.day),
  );

  return (
    <div style={{ height: 320 }}>
      {data.length === 0 ? (
        <div className="text-sm text-muted-foreground">No data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" hide />
            <YAxis tickFormatter={(v) => formatMoney(v)} />
            <Tooltip
              formatter={(v, name) => [formatMoney(v), name]}
              labelFormatter={(l) => `Day: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="revenueCents"
              stroke="currentColor"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ingredientCostCents"
              stroke="currentColor"
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
