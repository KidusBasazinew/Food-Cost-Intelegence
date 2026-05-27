import { Bell, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PageShell,
  AnalyticsCard,
  EmptyState,
} from "@/components/ui/erp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useNotifications } from "../hooks/useNotifications";
import { computeSince } from "../utils/time";
import { NotificationItem } from "../components/NotificationItem";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All categories" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "PURCHASE_CREATED", label: "Purchases" },
  { value: "PURCHASE_STATUS_CHANGED", label: "Purchase status" },
  { value: "WASTE_ALERT", label: "Waste" },
  { value: "PROFITABILITY_ALERT", label: "Profitability" },
  { value: "SYSTEM_ALERT", label: "System" },
];

export function NotificationsPage() {
  const navigate = useNavigate();

  const [view, setView] = useState("all");
  const [type, setType] = useState("ALL");
  const [range, setRange] = useState("30d");

  const since = useMemo(() => computeSince(range), [range]);

  const filters = useMemo(() => {
    return {
      unreadOnly: view === "unread" ? true : undefined,
      severity: view === "critical" ? "CRITICAL" : undefined,
      type: type === "ALL" ? undefined : type,
      since,
    };
  }, [since, type, view]);

  const { query, markRead, markAllRead } = useNotifications({ filters });

  const items = (query.data?.pages ?? []).flatMap((p) => p?.items ?? []);

  return (
    <PageShell>
      <PageHeader
        title="Notifications"
        subtitle="Operational alerts across inventory, waste, purchasing, and profitability."
        badge={
          <span className="inline-flex items-center gap-2 rounded-full border bg-muted/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
            In-app alerts
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Mark all read
            </Button>
          </div>
        }
      />

      <AnalyticsCard
        title="Notification filters"
        description="Filter by unread, criticality, category, and date range."
        accent="purple"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border bg-muted/20 p-1">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
              { key: "critical", label: "Critical" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  view === t.key
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setView(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-9 w-[220px] rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-9 w-[160px] rounded-xl">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Notification center"
        description="Recent operational alerts"
        accent="blue"
      >
        {query.isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading notifications…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You have no alerts for the selected filters."
          />
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                  if (n.actionUrl) navigate(n.actionUrl);
                }}
                onMarkRead={() => markRead.mutate(n.id)}
              />
            ))}

            <div className="pt-2">
              {query.hasNextPage ? (
                <Button
                  variant="secondary"
                  className="w-full rounded-xl"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load more
                </Button>
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  You’re up to date.
                </div>
              )}
            </div>
          </div>
        )}
      </AnalyticsCard>
    </PageShell>
  );
}
