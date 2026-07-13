import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCard({
  title,
  description,
  children,
  actions,
  loading = false,
  accent = "purple",
  className,
  contentClassName,
}) {
  const accentBorder = {
    purple: "border-t-violet-500",
    blue: "border-t-blue-500",
    emerald: "border-t-emerald-500",
    amber: "border-t-amber-500",
    rose: "border-t-rose-500",
    cyan: "border-t-cyan-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-erp",
        "border-t-4",
        accentBorder[accent] || accentBorder.purple,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ?? (
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className={cn("p-5", contentClassName)}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
