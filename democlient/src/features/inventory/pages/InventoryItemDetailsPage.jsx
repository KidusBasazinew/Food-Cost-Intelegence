import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateInventoryTransactionMutation,
  useInventoryItemQuery,
  useInventoryTransactionsQuery,
} from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  AnalyticsCard,
  DataTable,
  DialogForm,
  FormField,
  FormSection,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const TYPE_STATUS = {
  ADJUSTMENT: "warning",
  WASTE: "danger",
  CONSUMPTION: "operational",
  TRANSFER: "info",
  PURCHASE: "success",
};

export function InventoryItemDetailsPage() {
  const { id } = useParams();
  const itemQuery = useInventoryItemQuery(id);
  const unitsQuery = useMeasurementUnitsQuery();
  const txnsQuery = useInventoryTransactionsQuery(
    { inventoryItemId: id },
    { enabled: Boolean(id) },
  );
  const createTxn = useCreateInventoryTransactionMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "ADJUSTMENT",
    quantity: "",
    unitId: "",
    unitCostCents: "",
    note: "",
  });

  const item = itemQuery.data;
  const allowedUnits = useMemo(() => {
    const units = unitsQuery.data || [];
    if (!item?.baseUnit?.baseType) return units;
    return units.filter((u) => u.baseType === item.baseUnit.baseType);
  }, [unitsQuery.data, item?.baseUnit?.baseType]);

  const canSubmit =
    Boolean(id) &&
    form.type &&
    form.quantity.trim() &&
    form.unitId &&
    !createTxn.isPending;

  async function onSubmit() {
    if (!canSubmit) return;
    await createTxn.mutateAsync({
      inventoryItemId: id,
      type: form.type,
      quantity: form.quantity,
      unitId: form.unitId,
      unitCostCents: form.unitCostCents.trim() ? form.unitCostCents : undefined,
      note: form.note.trim() ? form.note.trim() : undefined,
    });
    setForm((f) => ({ ...f, quantity: "", unitCostCents: "", note: "" }));
    setDialogOpen(false);
  }

  const txns = txnsQuery.data || [];
  const stock = toNumber(item?.quantityInStock);
  const min = toNumber(item?.minimumStockLevel);
  const isLow = min > 0 && stock <= min;

  const txnColumns = useMemo(
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
          `${toNumber(row.original.quantityInBaseUnit).toLocaleString()} ${item?.baseUnit?.symbol}`,
      },
      {
        id: "ref",
        header: "Reference",
        cell: ({ row }) =>
          row.original.referenceType
            ? `${row.original.referenceType}:${String(row.original.referenceId).slice(0, 8)}`
            : "—",
      },
    ],
    [item?.baseUnit?.symbol],
  );

  return (
    <PageShell>
      <PageHeader
        title={item?.name || "Item Details"}
        subtitle={
          item?.sku
            ? `SKU: ${item.sku}`
            : "Inventory item snapshot and transactions"
        }
        badge={
          item ? (
            <StatusBadge
              status={isLow ? "low_stock" : "active"}
              label={isLow ? "Low stock" : "In stock"}
            />
          ) : null
        }
        actions={
          <>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log transaction
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/inventory/items">All items</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/transactions">Transactions</Link>
            </Button>
          </>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard
          label="In stock"
          value={
            item ? `${stock.toLocaleString()} ${item.baseUnit?.symbol}` : "—"
          }
          icon={Package}
          accent={isLow ? "rose" : "blue"}
          loading={itemQuery.isLoading}
        />
        <KpiCard
          label="Minimum"
          value={
            item ? `${min.toLocaleString()} ${item.baseUnit?.symbol}` : "—"
          }
          accent="amber"
          loading={itemQuery.isLoading}
        />
        <KpiCard
          label="Avg cost / base"
          value={
            item
              ? (
                  toNumber(item.averageCostPerBaseUnitCents) / 100
                ).toLocaleString(undefined, {
                  style: "currency",
                  currency: "ETB",
                  currencyDisplay: "code",
                  maximumFractionDigits: 4,
                })
              : "—"
          }
          accent="indigo"
          loading={itemQuery.isLoading}
        />
        <KpiCard
          label="Category"
          value={item?.category || "—"}
          accent="purple"
          loading={itemQuery.isLoading}
        />
      </KpiGrid>

      <AnalyticsCard title="Recent transactions" accent="cyan">
        <DataTable
          columns={txnColumns}
          data={txns.slice(0, 50)}
          loading={txnsQuery.isLoading}
          enableSearch={false}
          pageSize={12}
          emptyTitle="No transactions yet"
        />
      </AnalyticsCard>

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Log transaction"
        description={`Base type: ${item?.baseUnit?.baseType || "—"}`}
        onSubmit={onSubmit}
        submitLabel="Create transaction"
        loading={createTxn.isPending}
        size="lg"
      >
        <FormSection title="Transaction">
          <FormField label="Type">
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADJUSTMENT">Adjustment (+/-)</SelectItem>
                <SelectItem value="WASTE">Waste (-)</SelectItem>
                <SelectItem value="CONSUMPTION">Consumption (-)</SelectItem>
                <SelectItem value="TRANSFER">Transfer (-)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Quantity">
            <Input
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
              placeholder={
                form.type === "ADJUSTMENT" ? "e.g. 5 or -5" : "e.g. 5"
              }
            />
          </FormField>
          <FormField label="Unit">
            <Select
              value={form.unitId}
              onValueChange={(v) => setForm((f) => ({ ...f, unitId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit…" />
              </SelectTrigger>
              <SelectContent>
                {allowedUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Unit cost (cents)">
            <Input
              value={form.unitCostCents}
              onChange={(e) =>
                setForm((f) => ({ ...f, unitCostCents: e.target.value }))
              }
              placeholder="optional"
            />
          </FormField>
          <FormField label="Note" fullWidth>
            <Input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional context"
            />
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
