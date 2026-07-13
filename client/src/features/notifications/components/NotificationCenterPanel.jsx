import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/erp";
import { cn } from "@/lib/utils";

import { useNotifications } from "../hooks/useNotifications";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { computeSince } from "../utils/time";
import { NotificationItem } from "./NotificationItem";

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

export function NotificationCenterPanel({ onViewAll }) {
  const navigate = useNavigate();

  const [view, setView] = useState("all"); // all | unread | critical
  const [type, setType] = useState("ALL");
  const [range, setRange] = useState("7d");

  const since = useMemo(() => computeSince(range), [range]);

  const filters = useMemo(() => {
    return {
      unreadOnly: view === "unread" ? true : undefined,
      severity: view === "critical" ? "CRITICAL" : undefined,
      type: type === "ALL" ? undefined : type,
      since,
    };
  }, [since, type, view]);

  const unread = useUnreadCount();
  const { query, markRead, markAllRead } = useNotifications({ filters });

  const pages = query.data?.pages ?? [];
  const items = pages.flatMap((p) => p?.items ?? []);

  const isEmpty = !query.isLoading && items.length === 0;

  return (
    <>
      <DialogHeader className="border-b bg-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </DialogTitle>
            <DialogDescription>
              {unread.data?.count
                ? `${unread.data.count} unread`
                : "All caught up"}
            </DialogDescription>
          </div>

          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all read
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
            <SelectTrigger className="h-9 w-52 rounded-xl">
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
            <SelectTrigger className="h-9 w-36 rounded-xl">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            className="ml-auto rounded-xl"
            onClick={() =>
              onViewAll ? onViewAll() : navigate("/notifications")
            }
          >
            View all
          </Button>
        </div>
      </DialogHeader>

      <DialogBody className="bg-muted/10">
        {query.isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading notifications…
          </div>
        ) : isEmpty ? (
          <EmptyState
            title="No notifications"
            description="You have no alerts for the selected filters."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
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
            </AnimatePresence>

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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4 text-center text-xs text-muted-foreground"
                >
                  You’re up to date.
                </motion.div>
              )}
            </div>
          </div>
        )}
      </DialogBody>
    </>
  );
}
