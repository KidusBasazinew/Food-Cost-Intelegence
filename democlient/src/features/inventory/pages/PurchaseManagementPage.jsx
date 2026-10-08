import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingCart } from "lucide-react";

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
  useCreatePurchaseMutation,
  usePurchasesQuery,
  useUpdatePurchaseMutation,
} from "@/features/inventory/hooks/usePurchases";
import { useSuppliersQuery } from "@/features/inventory/hooks/useSuppliers";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  AnalyticsCard,
  DataTable,
  DialogForm,
  FormField,
  FormSection,
  InsightPanel,
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

function formatMoneyFromCents(cents) {
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "ETB",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  });
}

const EMPTY_LINE = {
  inventoryItemId: "",
  unitId: "",
  quantity: "",
  unitCostCents: "",
};

const EMPTY_FORM = {
  supplierId: "",
  taxCents: "0",
  notes: "",
  items: [EMPTY_LINE],
};

const STATUS_MAP = {
  RECEIVED: "completed",
  PENDING: "pending",
  CANCELLED: "cancelled",
  DRAFT: "draft",
};

export function PurchaseManagementPage() {
  const suppliersQuery = useSuppliersQuery();
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();
  const purchasesQuery = usePurchasesQuery();
  const createPurchase = useCreatePurchaseMutation();
  const updatePurchase = useUpdatePurchaseMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const suppliers = suppliersQuery.data || [];
  const inventoryItems = itemsQuery.data || [];
  const units = unitsQuery.data || [];
  const purchases = purchasesQuery.data || [];

  const itemById = useMemo(
    () => new Map(inventoryItems.map((i) => [i.id, i])),
    [inventoryItems],
  );

  const canSubmit =
    form.supplierId &&
    form.items.length > 0 &&
    form.items.every(
      (l) =>
        l.inventoryItemId &&
        l.unitId &&
        l.quantity.trim() &&
        l.unitCostCents.trim(),
    ) &&
    !createPurchase.isPending;

  function setLine(idx, patch) {
    setForm((f) => {
      const next = [...f.items];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, items: next };
    });
  }

  function addLine() {
    setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_LINE }] }));
  }

  function removeLine(idx) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));
  }

  async function onSubmit() {
    if (!canSubmit) return;
    await createPurchase.mutateAsync({
      supplierId: form.supplierId,
      taxCents: form.taxCents,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
      items: form.items.map((l) => ({
        inventoryItemId: l.inventoryItemId,
        unitId: l.unitId,
        quantity: l.quantity,
        unitCostCents: l.unitCostCents,
      })),
    });
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  }

  const receivedCount = purchases.filter((p) => p.status === "RECEIVED").length;
  const pendingCount = purchases.filter(
    (p) => p.status !== "RECEIVED" && p.status !== "CANCELLED",
  ).length;

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
        id: "supplier",
        header: "Supplier",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.supplier?.name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge
            status={STATUS_MAP[getValue()] || "pending"}
            label={getValue()}
          />
        ),
      },
      {
        id: "total",
        header: "Total",
        cell: ({ row }) => formatMoneyFromCents(row.original.totalCents),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const p = row.original;
          if (p.status === "RECEIVED") {
            return (
              <span className="text-xs text-muted-foreground">
                Received{" "}
                {p.receivedAt
                  ? new Date(p.receivedAt).toLocaleDateString()
                  : ""}
              </span>
            );
          }
          if (p.status === "CANCELLED") {
            return <StatusBadge status="cancelled" label="Cancelled" />;
          }
          return (
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() =>
                updatePurchase.mutate({
                  id: p.id,
                  input: { status: "RECEIVED" },
                })
              }
              disabled={updatePurchase.isPending}
            >
              Mark received
            </Button>
          );
        },
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Purchase Management"
        subtitle="Create purchase orders and receive them into stock."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/suppliers">Suppliers</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/dashboard">Inventory</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create purchase
            </Button>
          </>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Total purchases"
          value={purchases.length}
          icon={ShoppingCart}
          accent="purple"
          loading={purchasesQuery.isLoading}
        />
        <KpiCard
          label="Received"
          value={receivedCount}
          accent="emerald"
          loading={purchasesQuery.isLoading}
        />
        <KpiCard
          label="Pending"
          value={pendingCount}
          accent="amber"
          loading={purchasesQuery.isLoading}
        />
      </KpiGrid>

      <InsightPanel variant="info" title="Receiving purchases">
        Marking a purchase as received writes inventory transactions and updates
        weighted average cost automatically.
      </InsightPanel>

      <DataTable
        columns={columns}
        data={purchases}
        loading={purchasesQuery.isLoading}
        searchPlaceholder="Search purchases…"
        emptyTitle="No purchases yet"
        emptyDescription="Create your first purchase order to receive stock."
      />

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create purchase"
        description="Add line items and assign a supplier."
        onSubmit={onSubmit}
        submitLabel="Create purchase"
        loading={createPurchase.isPending}
        size="xl"
        className="sm:max-w-4xl"
      >
        <FormSection title="Order details">
          <FormField label="Supplier">
            <Select
              value={form.supplierId}
              onValueChange={(v) => setForm((f) => ({ ...f, supplierId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier…" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tax (cents)">
            <Input
              value={form.taxCents}
              onChange={(e) =>
                setForm((f) => ({ ...f, taxCents: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Notes" fullWidth>
            <Input
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="optional"
            />
          </FormField>
        </FormSection>

        <AnalyticsCard
          title="Line items"
          accent="blue"
          contentClassName="space-y-3"
        >
          {form.items.map((line, idx) => {
            const selectedItem = itemById.get(line.inventoryItemId);
            const baseType = selectedItem?.baseUnit?.baseType;
            const allowedUnits = baseType
              ? units.filter((u) => u.baseType === baseType)
              : units;

            return (
              <div
                key={idx}
                className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <FormField label="Item">
                    <Select
                      value={line.inventoryItemId}
                      onValueChange={(v) =>
                        setLine(idx, { inventoryItemId: v, unitId: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item…" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name} ({i.baseUnit?.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="lg:col-span-3">
                  <FormField label="Unit">
                    <Select
                      value={line.unitId}
                      onValueChange={(v) => setLine(idx, { unitId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit…" />
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
                </div>
                <div className="lg:col-span-2">
                  <FormField label="Qty">
                    <Input
                      value={line.quantity}
                      onChange={(e) =>
                        setLine(idx, { quantity: e.target.value })
                      }
                      placeholder="2"
                    />
                  </FormField>
                </div>
                <div className="lg:col-span-2">
                  <FormField label="Unit cost (¢)">
                    <Input
                      value={line.unitCostCents}
                      onChange={(e) =>
                        setLine(idx, { unitCostCents: e.target.value })
                      }
                      placeholder="500"
                    />
                  </FormField>
                </div>
                <div className="flex items-end lg:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(idx)}
                    disabled={form.items.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={addLine}
          >
            Add line
          </Button>
        </AnalyticsCard>
      </DialogForm>
    </PageShell>
  );
}
