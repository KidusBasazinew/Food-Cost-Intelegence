import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, History, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { posService } from "@/services/pos.service";
import { formatMoney, toNumber } from "@/features/analytics/utils/numbers";
import {
  PageShell,
  PageHeader,
  AnalyticsCard,
  DataTable,
  StatusBadge,
} from "@/components/ui/erp";

// Utility formatting matching analytics utilities file patterns
function formatETB(cents) {
  const n = Number(cents ?? 0);
  if (!Number.isFinite(n)) return "ETB 0.00";
  return `ETB ${(n / 100).toFixed(2)}`;
}

// Maps pipeline status keywords dynamically to corporate system design states
function getStatusVariant(status) {
  switch (status) {
    case "COMPLETED":
    case "SERVED":
      return "active";
    case "PREPARING":
    case "SENT_TO_KITCHEN":
      return "warning";
    case "CANCELLED":
      return "critical";
    default:
      return "neutral";
  }
}

export function PosOrderHistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const res = await posService.listOrders({ page: nextPage, limit: 20 });
      setData(res);
    } catch (err) {
      toast.error(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  const rows = data?.rows ?? [];

  // Re-usable column configuration mapping cleanly to your explicit DataTable system
  const columns = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.orderNumber}
          </span>
        ),
      },
      {
        accessorKey: "tableNumber",
        header: "Table",
        cell: ({ getValue }) => `Table ${getValue()}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const statusStr = getValue() || "";
          return (
            <StatusBadge
              status={getStatusVariant(statusStr)}
              label={statusStr.replaceAll("_", " ")}
            />
          );
        },
      },
      {
        accessorKey: "waiterName",
        header: "Waiter",
      },
      {
        accessorKey: "items",
        header: "Items Count",
        cell: ({ row }) => {
          const itemCount = (row.original.items ?? []).reduce(
            (total, item) => total + toNumber(item?.quantity),
            0,
          );
          return <span>{itemCount}</span>;
        },
      },
      {
        accessorKey: "totalCents",
        header: () => <div className="text-right">Total</div>,
        cell: ({ getValue }) => (
          <div className="text-right font-semibold text-foreground">
            {formatETB(getValue())}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      {/* Structural Page Header Context */}
      <PageHeader
        title="POS Order History"
        subtitle={`Audit ledger view of historically processed point-of-sale customer logs. Currently tracking ${data?.total ?? 0} total logs.`}
        action={
          <Button
            variant="secondary"
            onClick={() => load(page)}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Records
          </Button>
        }
      />

      {/* Main Table Interface Containment Wrapper */}
      <div className="mt-2">
        <AnalyticsCard accent="purple" title="Order Transactions Pipeline">
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            enableSearch={false}
            pageSize={20}
            emptyTitle="No orders captured within this period yet"
          />

          {/* Context Pagination Controls Layer */}
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              disabled={(data?.page ?? 1) <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border">
              Page {data?.page ?? 1} of {data?.pages ?? 1}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              disabled={(data?.page ?? 1) >= (data?.pages ?? 1) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </AnalyticsCard>
      </div>
    </PageShell>
  );
}
