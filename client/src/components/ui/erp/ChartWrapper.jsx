import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export function ChartWrapper({
  height = 320,
  children,
  empty = false,
  emptyTitle,
  emptyDescription,
  className,
}) {
  if (empty) {
    return (
      <EmptyState
        title={emptyTitle || "No chart data"}
        description={emptyDescription}
        className="py-12"
      />
    );
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const CHART_COLORS = {
  primary: "hsl(var(--erp-purple))",
  secondary: "hsl(var(--erp-blue))",
  success: "hsl(var(--erp-emerald))",
  warning: "hsl(var(--erp-amber))",
  danger: "hsl(var(--erp-rose))",
  cyan: "hsl(var(--erp-cyan))",
  palette: [
    "hsl(var(--erp-purple))",
    "hsl(var(--erp-blue))",
    "hsl(var(--erp-emerald))",
    "hsl(var(--erp-amber))",
    "hsl(var(--erp-cyan))",
    "hsl(var(--erp-rose))",
  ],
};

export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-card/95 px-3 py-2 shadow-erp-elevated backdrop-blur-sm">
      {label ? (
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      ) : null}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
