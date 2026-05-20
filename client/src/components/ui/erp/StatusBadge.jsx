import { Badge } from "@/components/ui/badge";

const STATUS_MAP = {
  active: "success",
  completed: "success",
  approved: "success",
  profitable: "success",
  in_stock: "success",
  pending: "warning",
  warning: "warning",
  low_stock: "warning",
  draft: "muted",
  inactive: "muted",
  critical: "danger",
  rejected: "danger",
  loss: "danger",
  overdue: "danger",
  cancelled: "danger",
  operational: "info",
  realtime: "cyan",
  analytics: "purple",
  processing: "info",
};

export function StatusBadge({ status, label, className }) {
  const key = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const variant = STATUS_MAP[key] || "secondary";

  return (
    <Badge variant={variant} className={className}>
      {label || status}
    </Badge>
  );
}
