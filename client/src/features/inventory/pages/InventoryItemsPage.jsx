import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreateInventoryItemMutation,
  useInventoryItemsQuery,
} from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";

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

export function InventoryItemsPage() {
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();

  const createMutation = useCreateInventoryItemMutation();

  const baseUnits = useMemo(() => {
    const units = unitsQuery.data || [];
    return units.filter((u) => u.isBaseUnit);
  }, [unitsQuery.data]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "OTHER",
    baseUnitId: "",
    minimumStockLevel: "0",
  });

  const canSubmit =
    form.name.trim().length > 0 && form.baseUnitId && !createMutation.isPending;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    await createMutation.mutateAsync({
      name: form.name.trim(),
      sku: form.sku.trim() ? form.sku.trim() : undefined,
      category: form.category,
      baseUnitId: form.baseUnitId,
      minimumStockLevel: form.minimumStockLevel,
    });

    setForm((f) => ({
      ...f,
      name: "",
      sku: "",
      minimumStockLevel: "0",
    }));
  }

  const items = itemsQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Inventory Items</div>
          <div className="mt-1 text-sm text-muted-foreground">
            All quantities are stored in base units (g/ml/piece).
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/inventory/measurement-units">Manage units</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Create Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Tomatoes"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                SKU (optional)
              </div>
              <Input
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Category</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Base Unit</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.baseUnitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, baseUnitId: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {baseUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Min Stock</div>
              <Input
                value={form.minimumStockLevel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minimumStockLevel: e.target.value }))
                }
                placeholder="0"
              />
            </div>

            <div className="md:col-span-5">
              <Button type="submit" disabled={!canSubmit}>
                {createMutation.isPending ? "Creating…" : "Create item"}
              </Button>
              {unitsQuery.isLoading && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Loading measurement units…
                </span>
              )}
              {!unitsQuery.isLoading && baseUnits.length === 0 && (
                <span className="ml-3 text-xs text-muted-foreground">
                  No base units found yet. Create them via the API.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Avg Cost / Base</th>
                  <th className="py-2">Min</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {itemsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      No items yet.
                    </td>
                  </tr>
                ) : (
                  items.map((i) => {
                    const min = toNumber(i.minimumStockLevel);
                    const stock = toNumber(i.quantityInStock);
                    const low = min > 0 && stock <= min;

                    return (
                      <tr key={i.id} className="border-b last:border-b-0">
                        <td className="py-2">
                          <Link
                            className="font-medium hover:underline"
                            to={`/inventory/items/${i.id}`}
                          >
                            {i.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {i.sku
                              ? `SKU: ${i.sku}`
                              : `Base: ${i.baseUnit?.symbol}`}
                          </div>
                        </td>
                        <td className="py-2">{i.category}</td>
                        <td className="py-2">
                          {stock.toLocaleString()} {i.baseUnit?.symbol}
                        </td>
                        <td className="py-2">
                          {(
                            toNumber(i.averageCostPerBaseUnitCents) / 100
                          ).toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 4,
                          })}
                        </td>
                        <td className="py-2">
                          {min.toLocaleString()} {i.baseUnit?.symbol}
                        </td>
                        <td className="py-2">
                          <span
                            className={
                              "inline-flex rounded-full border px-2 py-0.5 text-xs " +
                              (low
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-slate-200 bg-slate-50 text-slate-700")
                            }
                          >
                            {low ? "Low" : "OK"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
