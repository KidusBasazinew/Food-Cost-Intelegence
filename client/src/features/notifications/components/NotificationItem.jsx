import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { accentStyles } from "@/components/ui/erp/colors";
import { timeAgo } from "../utils/time";

function iconFor(type, severity) {
  if (severity === "CRITICAL") return ShieldAlert;
  if (type === "PROFITABILITY_ALERT") return TrendingUp;
  if (type === "WASTE_ALERT") return AlertTriangle;
  if (severity === "SUCCESS") return CheckCircle2;
  if (severity === "WARNING" || severity === "HIGH") return AlertTriangle;
  if (severity === "INFO") return Info;
  return Bell;
}

function severityBadge(severity) {
  const map = {
    INFO: { label: "Info", variant: "secondary" },
    SUCCESS: { label: "Success", variant: "secondary" },
    WARNING: { label: "Warning", variant: "destructive" },
    HIGH: { label: "High", variant: "destructive" },
    CRITICAL: { label: "Critical", variant: "destructive" },
  };
  return map[severity] ?? map.INFO;
}

function accentForType(type) {
  switch (type) {
    case "LOW_STOCK":
      return "amber";
    case "OUT_OF_STOCK":
      return "rose";
    case "WASTE_ALERT":
      return "orange";
    case "PROFITABILITY_ALERT":
      return "purple";
    case "PURCHASE_CREATED":
      return "blue";
    case "PURCHASE_STATUS_CHANGED":
      return "indigo";
    case "SYSTEM_ALERT":
      return "cyan";
    default:
      return "blue";
  }
}

function accentDotClass(accent) {
  const map = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    purple: "bg-violet-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    cyan: "bg-cyan-500",
    orange: "bg-orange-500",
  };
  return map[accent] ?? map.blue;
}

export function NotificationItem({ notification, onClick, onMarkRead }) {
  const isUnread = !notification?.isRead;
  const Icon = iconFor(notification?.type, notification?.severity);
  const badge = severityBadge(notification?.severity);

  const accentKey = accentForType(notification?.type);
  const accent = accentStyles[accentKey] ?? accentStyles.blue;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all",
        accent.bg,
        accent.border,
        "hover:shadow-erp",
        isUnread && cn("ring-1 ring-inset", accent.ring),
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1 bg-linear-to-b", accent.icon)}
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white",
            "bg-linear-to-br shadow-sm ring-1 ring-inset",
            accent.icon,
            accent.ring,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "truncate text-sm font-semibold",
                    isUnread ? accent.text : "text-foreground",
                  )}
                >
                  {notification?.title}
                </p>
                {isUnread ? (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      accentDotClass(accentKey),
                    )}
                  />
                ) : null}
              </div>
              {notification?.message ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <Badge variant={badge.variant} className="rounded-full">
                {badge.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {timeAgo(notification?.createdAt)}
              </span>
            </div>
          </div>

          {isUnread ? (
            <button
              type="button"
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium",
                "opacity-0 transition-opacity group-hover:opacity-100",
                "hover:bg-card/60",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead?.();
              }}
            >
              Mark read
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
