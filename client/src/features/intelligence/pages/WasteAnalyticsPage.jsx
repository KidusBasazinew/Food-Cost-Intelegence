import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  useLogWasteMutation,
  useWasteReportQuery,
} from "@/features/intelligence/hooks/useWaste";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  const v = toNumber(cents) / 100;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function WasteAnalyticsPage() {
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();

  const reportQuery = useWasteReportQuery({});
  const logMutation = useLogWasteMutation();

  const items = itemsQuery.data || [];
  const units = unitsQuery.data || [];

  const itemById = useMemo(() => {
    const m = new Map();
    for (const i of items) m.set(i.id, i);
    return m;
  }, [items]);

  const [form, setForm] = useState({
    inventoryItemId: "",
    unitId: "",
    quantity: "",
    notes: "",
  });

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

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    await logMutation.mutateAsync({
      inventoryItemId: form.inventoryItemId,
      unitId: form.unitId,
      quantity: form.quantity,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    });

    setForm({ inventoryItemId: "", unitId: "", quantity: "", notes: "" });
  }

  const report = reportQuery.data;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">Waste Analytics</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Log kitchen waste and track cost impact.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Log waste</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">
                Inventory item
              </div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.inventoryItemId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const nextItem = nextId ? itemById.get(nextId) : null;
                  setForm((f) => ({
                    ...f,
                    inventoryItemId: nextId,
                    unitId: nextItem?.baseUnitId ?? "",
                  }));
                }}
              >
                <option value="">Select…</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (base: {i.baseUnit?.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Unit</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.unitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitId: e.target.value }))
                }
                disabled={!selectedItem}
              >
                <option value="">Select…</option>
                {allowedUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Quantity</div>
              <Input
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="e.g. 0.5"
              />
            </div>

            <div className="md:col-span-4">
              <div className="text-xs text-muted-foreground">
                Notes (optional)
              </div>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="e.g. spoiled during prep"
              />
            </div>

            <div className="md:col-span-4">
              <Button type="submit" disabled={!canSubmit}>
                {logMutation.isPending ? "Logging…" : "Log waste"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Waste report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Rows</th>
                  <th className="py-2">Quantity (base)</th>
                  <th className="py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : (report?.items || []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      No waste records yet.
                    </td>
                  </tr>
                ) : (
                  report.items.slice(0, 12).map((i) => (
                    <tr
                      key={i.inventoryItemId}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-2 font-medium">{i.name}</td>
                      <td className="py-2">{i.count}</td>
                      <td className="py-2">
                        {toNumber(i.totalQuantityBaseUnit).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 4,
                          },
                        )}{" "}
                        {i.baseUnitSymbol}
                      </td>
                      <td className="py-2">{formatMoney(i.totalCostCents)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
