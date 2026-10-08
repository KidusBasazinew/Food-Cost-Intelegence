import { Bell, ChevronRight, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AnalyticsCard, EmptyState } from "@/components/ui/erp";

import { useNotifications } from "../hooks/useNotifications";
import { computeSince } from "../utils/time";

export function DashboardNotificationsWidget() {
  const since = useMemo(() => computeSince("7d"), []);

  const filters = useMemo(
    () => ({
      unreadOnly: true,
      // Include critical and high; critical is surfaced by order.
      since,
    }),
    [since],
  );

  const { query } = useNotifications({
    filters,
    refetchInterval: 15000,
  });

  const items = (query.data?.pages ?? [])
    .flatMap((p) => p?.items ?? [])
    .slice(0, 5);

  return (
    <AnalyticsCard
      title="Alerts & notifications"
      description="Unread operational alerts requiring attention"
      accent="rose"
    >
      {query.isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading alerts…
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="All clear"
          description="No unread operational alerts."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="rounded-xl border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{n.title}</p>
                  {n.message ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                  ) : null}
                </div>
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              </div>
            </div>
          ))}

          <Button asChild variant="secondary" className="w-full rounded-xl">
            <Link to="/notifications">
              View notification center
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </AnalyticsCard>
  );
}
