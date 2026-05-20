import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  KpiCard,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";
import { useInventoryTransactionsQuery } from "@/features/inventory/hooks/useInventoryItems";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  if (cents == null) return "—";
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

const TYPE_STATUS = {
  PURCHASE: "success",
  RECEIPT: "success",
  WASTE: "danger",
  ADJUSTMENT: "warning",
  TRANSFER: "info",
  CONSUMPTION: "operational",
};

export function InventoryTransactionsPage() {
  const txnsQuery = useInventoryTransactionsQuery();
  const txns = txnsQuery.data || [];

  const columns = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "—",
      },
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => (
          <div>
            <Link
              className="font-medium text-primary hover:underline"
              to={`/inventory/items/${row.original.inventoryItem?.id}`}
            >
              {row.original.inventoryItem?.name || "—"}
            </Link>
            <div className="text-xs text-muted-foreground">
              Base: {row.original.inventoryItem?.baseUnit?.symbol}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <StatusBadge
            status={TYPE_STATUS[getValue()] || "operational"}
            label={getValue()}
          />
        ),
      },
      {
        id: "qty",
        header: "Qty",
        cell: ({ row }) =>
          `${toNumber(row.original.quantity).toLocaleString()} ${row.original.unit?.symbol}`,
      },
      {
        id: "baseQty",
        header: "Base qty",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityInBaseUnit).toLocaleString()} ${row.original.inventoryItem?.baseUnit?.symbol}`,
      },
      {
        id: "cost",
        header: "Cost",
        cell: ({ row }) => formatMoney(row.original.totalCostCents),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Inventory Transactions"
        subtitle="Purchases, adjustments, waste, consumption, and transfers."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/inventory/dashboard">Inventory dashboard</Link>
          </Button>
        }
      />

      <KpiCard
        label="Total transactions"
        value={txns.length}
        icon={ArrowLeftRight}
        accent="indigo"
        loading={txnsQuery.isLoading}
        hint="Full audit trail"
      />

      <DataTable
        columns={columns}
        data={txns}
        loading={txnsQuery.isLoading}
        searchPlaceholder="Search transactions…"
        pageSize={15}
        emptyTitle="No transactions yet"
        emptyDescription="Transactions appear when you receive purchases, log waste, or adjust stock."
      />
    </PageShell>
  );
}
