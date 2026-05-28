import React, { useEffect, useMemo, useState } from "react";
import { Clock, RefreshCw, Layers, CheckSquare, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { posService } from "@/services/pos.service";
import {
  PageShell,
  PageHeader,
  KpiGrid,
  KpiCard,
  ContentGrid,
  AnalyticsCard,
  StatusBadge,
} from "@/components/ui/erp";

function formatAgo(ts) {
  if (!ts) return "—";
  const ms = Date.now() - new Date(ts).getTime();
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m < 1) return "just now";
  if (m === 1) return "1 min ago";
  return `${m} mins ago`;
}

// Maps status fields cleanly to your standardized ERP StatusBadge variants
function mapStatusToBadge(status) {
  switch (status) {
    case "SENT_TO_KITCHEN":
      return { status: "analytics", label: "Sent to Kitchen" };
    case "PREPARING":
      return { status: "warning", label: "Preparing" };
    case "READY":
      return { status: "active", label: "Ready" };
    case "SERVED":
      return { status: "neutral", label: "Served" };
    default:
      return {
        status: "neutral",
        label: status?.replaceAll("_", " ") || "Unknown",
      };
  }
}

function nextStatuses(status) {
  if (status === "SENT_TO_KITCHEN") return ["PREPARING", "CANCELLED"];
  if (status === "PREPARING") return ["READY", "CANCELLED"];
  if (status === "READY") return ["SERVED", "CANCELLED"];
  if (status === "SERVED") return ["COMPLETED", "CANCELLED"];
  return [];
}

export function KitchenDisplayPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const data = await posService.listKitchen({ limit: 200 });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load kitchen queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  // Compute metrics cleanly matching your executive layout architecture
  const stats = useMemo(() => {
    const by = new Map();
    for (const r of rows) {
      by.set(r.status, (by.get(r.status) ?? 0) + 1);
    }
    return {
      sent: by.get("SENT_TO_KITCHEN") ?? 0,
      preparing: by.get("PREPARING") ?? 0,
      ready: by.get("READY") ?? 0,
      served: by.get("SERVED") ?? 0,
      totalActive: rows.length,
    };
  }, [rows]);

  async function setStatus(orderId, status) {
    setBusyId(orderId);
    try {
      await posService.updateStatus(orderId, status);
      toast.success(`Order updated: ${status}`);
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update order");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell>
      {/* Structural Page Header with Refresh Action Element */}
      <PageHeader
        title="Kitchen Display System"
        subtitle="Live monitoring, item fulfillment routing, and real-time order lifecycle execution."
        action={
          <Button
            variant="secondary"
            onClick={load}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        }
      />

      {/* Structured KPI Row aligning with Executive Standard */}
      <KpiGrid cols={5}>
        <KpiCard
          label="Active Orders"
          value={stats.totalActive}
          icon={Layers}
          accent="purple"
          loading={loading}
        />
        <KpiCard
          label="Sent To Kitchen"
          value={stats.sent}
          icon={Clock}
          accent="blue"
          loading={loading}
        />
        <KpiCard
          label="Preparing"
          value={stats.preparing}
          icon={RefreshCw}
          accent="amber"
          loading={loading}
        />
        <KpiCard
          label="Ready for Pickup"
          value={stats.ready}
          icon={CheckSquare}
          accent="emerald"
          loading={loading}
        />
        <KpiCard
          label="Served"
          value={stats.served}
          icon={CheckSquare}
          accent="cyan"
          loading={loading}
        />
      </KpiGrid>

      {/* Main Ticket Interface using full scale Content Grids */}
      <div className="mt-2">
        {loading && rows.length === 0 ? (
          <div className="text-sm text-muted-foreground p-8 text-center border rounded-2xl bg-muted/20">
            Loading active kitchen queue...
          </div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground p-12 text-center border rounded-2xl bg-muted/20">
            No active tickets found in the queue.
          </div>
        ) : (
          <ContentGrid>
            {rows.map((o) => {
              const badgeProps = mapStatusToBadge(o.status);

              return (
                <AnalyticsCard
                  key={o.id}
                  title={`Table ${o.tableNumber} · ${o.orderNumber}`}
                  description={`Waiter: ${o.waiterName} · Guests: ${o.customerCount}`}
                  accent={
                    o.status === "READY"
                      ? "emerald"
                      : o.status === "PREPARING"
                        ? "amber"
                        : o.status === "SENT_TO_KITCHEN"
                          ? "blue"
                          : "purple"
                  }
                >
                  {/* Top Meta Stats Strip */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>Sent {formatAgo(o.sentToKitchenAt)}</span>
                    </div>
                    <StatusBadge
                      status={badgeProps.status}
                      label={badgeProps.label}
                    />
                  </div>

                  {/* Recipe Item Array Container */}
                  <div className="space-y-2.5 min-h-[140px]">
                    {(o.items ?? []).slice(0, 6).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm py-0.5"
                      >
                        <span className="font-medium text-foreground">
                          <span className="text-primary font-bold mr-2">
                            {it.quantity}×
                          </span>
                          {it.recipe?.name ?? "Item"}
                        </span>
                      </div>
                    ))}

                    {(o.items?.length ?? 0) > 6 && (
                      <div className="text-xs font-medium text-muted-foreground pt-1">
                        +{(o.items?.length ?? 0) - 6} more line items
                      </div>
                    )}
                  </div>

                  {/* Lower Command Bar / Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 flex-wrap">
                    {nextStatuses(o.status).map((st) => {
                      const isCancel = st === "CANCELLED";
                      return (
                        <Button
                          key={st}
                          variant={isCancel ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setStatus(o.id, st)}
                          disabled={busyId === o.id}
                          className={`h-9 font-medium px-4 ${
                            !isCancel && st === "READY"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                              : ""
                          }`}
                        >
                          {isCancel ? (
                            <span className="flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </span>
                          ) : (
                            st.replaceAll("_", " ")
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </AnalyticsCard>
              );
            })}
          </ContentGrid>
        )}
      </div>
    </PageShell>
  );
}
