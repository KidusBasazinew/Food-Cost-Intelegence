import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  useLogWasteMutation,
  useWasteReportQuery,
} from "@/features/intelligence/hooks/useWaste";
import {
  AnalyticsCard,
  DataTable,
  DialogForm,
  FormField,
  FormSection,
  InsightPanel,
  KpiCard,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

const EMPTY_FORM = {
  inventoryItemId: "",
  unitId: "",
  quantity: "",
  notes: "",
};

export function WasteAnalyticsPage() {
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();
  const reportQuery = useWasteReportQuery({});
  const logMutation = useLogWasteMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const items = itemsQuery.data || [];
  const units = unitsQuery.data || [];
  const report = reportQuery.data;

  const itemById = useMemo(() => {
    const m = new Map();
    for (const i of items) m.set(i.id, i);
    return m;
  }, [items]);

  const selectedItem = form.inventoryItemId
    ? itemById.get(form.inventoryItemId)
    : null;

  const allowedUnits = useMemo(() => {
    if (!selectedItem?.baseUnit?.baseType) return units;
    return units.filter((u) => u.baseType === selectedItem.baseUnit.baseType);
  }, [units, selectedItem]);

  const canSubmit =
    form.inventoryItemId &&
    form.unitId &&
    toNumber(form.quantity) > 0 &&
    !logMutation.isPending;

  async function onSubmit() {
    if (!canSubmit) return;
    await logMutation.mutateAsync({
      inventoryItemId: form.inventoryItemId,
      unitId: form.unitId,
      quantity: form.quantity,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    });
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  }

  const totalWasteCost = (report?.items || []).reduce(
    (acc, i) => acc + toNumber(i.totalCostCents),
    0,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      },
      { accessorKey: "count", header: "Entries" },
      {
        id: "qty",
        header: "Quantity (base)",
        cell: ({ row }) =>
          `${toNumber(row.original.totalQuantityBaseUnit).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${row.original.baseUnitSymbol}`,
      },
      {
        id: "cost",
        header: "Waste cost",
        cell: ({ row }) => (
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {formatMoney(row.original.totalCostCents)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Waste Analytics"
        subtitle="Log kitchen waste and track cost impact on food operations."
        actions={
          <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Log waste
          </Button>
        }
      />

      <InsightPanel variant="warning" title="Cost impact">
        Every waste entry deducts inventory and records the financial loss at
        current weighted average cost.
      </InsightPanel>

      <KpiCard
        label="Total waste loss"
        value={formatMoney(totalWasteCost)}
        icon={Trash2}
        accent="rose"
        loading={reportQuery.isLoading}
        hint={`${(report?.items || []).length} items tracked`}
      />

      <AnalyticsCard title="Waste report" description="By ingredient" accent="rose">
        <DataTable
          columns={columns}
          data={(report?.items || []).slice(0, 50)}
          loading={reportQuery.isLoading}
          enableSearch={false}
          pageSize={12}
          emptyTitle="No waste records yet"
          emptyDescription="Log your first waste entry to start tracking losses."
        />
      </AnalyticsCard>

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Log waste"
        description="Record spoiled or discarded inventory."
        onSubmit={onSubmit}
        submitLabel="Log waste"
        loading={logMutation.isPending}
        size="lg"
      >
        <FormSection title="Waste entry">
          <FormField label="Inventory item" fullWidth>
            <Select
              value={form.inventoryItemId}
              onValueChange={(v) => {
                const nextItem = v ? itemById.get(v) : null;
                setForm((f) => ({
                  ...f,
                  inventoryItemId: v,
                  unitId: nextItem?.baseUnitId ?? "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item…" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} (base: {i.baseUnit?.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Unit">
            <Select
              value={form.unitId}
              onValueChange={(v) => setForm((f) => ({ ...f, unitId: v }))}
              disabled={!selectedItem}
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
          <FormField label="Quantity">
            <Input
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="e.g. 0.5"
            />
          </FormField>
          <FormField label="Notes (optional)" fullWidth>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. spoiled during prep"
            />
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
