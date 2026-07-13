import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentStyles } from "./colors";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "purple",
  trend,
  trendLabel,
  loading = false,
  className,
}) {
  const styles = accentStyles[accent] || accentStyles.purple;
  const trendUp = trend != null && trend >= 0;
  const trendDown = trend != null && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-erp transition-shadow hover:shadow-erp-elevated",

        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60",
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        {Icon ? (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-4",
              styles.icon,
              styles.ring,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}

        {trend != null ? (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trendUp
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
          </div>
        ) : null}
      </div>

      <div className="relative mt-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        )}
        {hint || trendLabel ? (
          <p
            className={cn(
              "text-xs",
              trendDown && trend != null
                ? "text-rose-600 dark:text-rose-400"
                : trendUp && trend != null
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
            )}
          >
            {trendLabel || hint}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
