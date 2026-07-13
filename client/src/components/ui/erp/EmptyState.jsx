import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data yet",
  description,
  action,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 ring-1 ring-violet-500/20">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action || (onAction && actionLabel) ? (
        <div className="mt-6">
          {action ?? (
            <Button onClick={onAction} className="rounded-xl">
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
