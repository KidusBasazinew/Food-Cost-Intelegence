import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  InsightPanel,
  KpiCard,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function LowStockAlertsPage() {
  const itemsQuery = useInventoryItemsQuery({ lowStock: "true" });
  const items = itemsQuery.data || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ row }) => (
          <Link
            className="font-medium text-primary hover:underline"
            to={`/inventory/items/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {toNumber(row.original.quantityInStock).toLocaleString()}{" "}
            {row.original.baseUnit?.symbol}
          </span>
        ),
      },
      {
        id: "min",
        header: "Minimum",
        cell: ({ row }) =>
          `${toNumber(row.original.minimumStockLevel).toLocaleString()} ${row.original.baseUnit?.symbol}`,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <StatusBadge status="warning" label={getValue()} />
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Items at or below minimum stock levels — reorder before service impact."
        badge={
          items.length > 0 ? (
            <StatusBadge status="critical" label={`${items.length} alerts`} />
          ) : null
        }
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/inventory/dashboard">Inventory dashboard</Link>
          </Button>
        }
      />

      {items.length > 0 ? (
        <InsightPanel variant="critical" title="Immediate action recommended">
          Review each item below and create a purchase order to restore safe stock
          levels before the next service period.
        </InsightPanel>
      ) : null}

      <KpiCard
        label="Active alerts"
        value={items.length}
        icon={AlertTriangle}
        accent="rose"
        loading={itemsQuery.isLoading}
        hint={items.length === 0 ? "All stock levels healthy" : "Requires replenishment"}
      />

      <DataTable
        columns={columns}
        data={items}
        loading={itemsQuery.isLoading}
        enableSearch={false}
        emptyTitle="No low stock items"
        emptyDescription="All inventory is above minimum levels. Great job!"
      />
    </PageShell>
  );
}
