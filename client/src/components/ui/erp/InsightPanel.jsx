import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function InsightPanel({
  title = "Operational insight",
  children,
  variant = "info",
  className,
}) {
  const variants = {
    info: "border-blue-200/60 bg-blue-50/50 dark:border-blue-800/40 dark:bg-blue-950/30",
    warning:
      "border-amber-200/60 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/30",
    success:
      "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/30",
    critical:
      "border-rose-200/60 bg-rose-50/50 dark:border-rose-800/40 dark:bg-rose-950/30",
    analytics:
      "border-violet-200/60 bg-violet-50/50 dark:border-violet-800/40 dark:bg-violet-950/30",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        variants[variant] || variants.info,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
