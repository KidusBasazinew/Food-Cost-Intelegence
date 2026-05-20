import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartTooltip,
  ChartWrapper,
  CHART_COLORS,
} from "@/components/ui/erp";
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
    <ChartWrapper empty={data.length === 0} height={320}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11 }} width={72} />
        <Tooltip
          content={
            <ChartTooltip
              formatter={(v, name) => [
                formatMoney(v),
                name === "revenueCents" ? "Revenue" : "Ingredient cost",
              ]}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="revenueCents"
          stroke={CHART_COLORS.primary}
          fill="url(#revenueGrad)"
          strokeWidth={2}
          dot={false}
          name="revenueCents"
        />
        <Line
          type="monotone"
          dataKey="ingredientCostCents"
          stroke={CHART_COLORS.warning}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          name="ingredientCostCents"
        />
      </AreaChart>
    </ChartWrapper>
  );
}
