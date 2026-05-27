import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

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
  useCreateInventoryItemMutation,
  useInventoryItemsQuery,
} from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  DataTable,
  DialogForm,
  FormField,
  FormSection,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";

const categories = [
  "PRODUCE",
  "MEAT",
  "SEAFOOD",
  "DAIRY",
  "DRY_GOODS",
  "BEVERAGES",
  "SPICES",
  "BAKERY",
  "PACKAGING",
  "CLEANING",
  "OTHER",
];

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "OTHER",
  baseUnitId: "",
  minimumStockLevel: "0",
};

export function InventoryItemsPage() {
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();
  const createMutation = useCreateInventoryItemMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const baseUnits = useMemo(() => {
    const units = unitsQuery.data || [];
    return units.filter((u) => u.isBaseUnit);
  }, [unitsQuery.data]);

  const canSubmit =
    form.name.trim().length > 0 && form.baseUnitId && !createMutation.isPending;

  async function onSubmit() {
    if (!canSubmit) return;

    await createMutation.mutateAsync({
      name: form.name.trim(),
      sku: form.sku.trim() ? form.sku.trim() : undefined,
      category: form.category,
      baseUnitId: form.baseUnitId,
      minimumStockLevel: form.minimumStockLevel,
    });

    setForm(EMPTY_FORM);
    setDialogOpen(false);
  }

  const items = itemsQuery.data || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <Link
              className="font-medium text-primary hover:underline"
              to={`/inventory/items/${row.original.id}`}
            >
              {row.original.name}
            </Link>
            <div className="text-xs text-muted-foreground">
              {row.original.sku
                ? `SKU: ${row.original.sku}`
                : `Base: ${row.original.baseUnit?.symbol}`}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <StatusBadge status="operational" label={getValue()} />
        ),
      },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityInStock).toLocaleString()} ${row.original.baseUnit?.symbol}`,
      },
      {
        id: "avgCost",
        header: "Avg Cost / Base",
        cell: ({ row }) =>
          (
            toNumber(row.original.averageCostPerBaseUnitCents) / 100
          ).toLocaleString(undefined, {
            style: "currency",
            currency: "ETB",
            currencyDisplay: "code",
            maximumFractionDigits: 4,
          }),
      },
      {
        id: "min",
        header: "Min",
        cell: ({ row }) =>
          `${toNumber(row.original.minimumStockLevel).toLocaleString()} ${row.original.baseUnit?.symbol}`,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const min = toNumber(row.original.minimumStockLevel);
          const stock = toNumber(row.original.quantityInStock);
          const low = min > 0 && stock <= min;
          return (
            <StatusBadge
              status={low ? "low_stock" : "active"}
              label={low ? "Low" : "OK"}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Inventory Items"
        subtitle="All quantities are stored in base units (g/ml/piece)."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/inventory/measurement-units">Manage units</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/dashboard">Dashboard</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create item
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        loading={itemsQuery.isLoading}
        searchPlaceholder="Search items…"
        emptyTitle="No inventory items yet"
        emptyDescription="Create your first item to start tracking stock."
      />

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create inventory item"
        description="Add a new item to your inventory catalog."
        onSubmit={onSubmit}
        submitLabel="Create item"
        loading={createMutation.isPending}
        size="lg"
      >
        <FormSection title="Item details">
          <FormField label="Name" fullWidth>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Tomatoes"
            />
          </FormField>
          <FormField label="SKU (optional)">
            <Input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="Optional"
            />
          </FormField>
          <FormField label="Category">
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Base unit">
            <Select
              value={form.baseUnitId}
              onValueChange={(v) => setForm((f) => ({ ...f, baseUnitId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit…" />
              </SelectTrigger>
              <SelectContent>
                {baseUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Minimum stock level">
            <Input
              value={form.minimumStockLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, minimumStockLevel: e.target.value }))
              }
              placeholder="0"
            />
          </FormField>
        </FormSection>
        {!unitsQuery.isLoading && baseUnits.length === 0 ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            No base units found. Create measurement units first.
          </p>
        ) : null}
      </DialogForm>
    </PageShell>
  );
}
