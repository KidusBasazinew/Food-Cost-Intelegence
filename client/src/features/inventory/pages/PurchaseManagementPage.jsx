import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreatePurchaseMutation,
  usePurchasesQuery,
  useUpdatePurchaseMutation,
} from "@/features/inventory/hooks/usePurchases";
import { useSuppliersQuery } from "@/features/inventory/hooks/useSuppliers";
import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoneyFromCents(cents) {
  const dollars = toNumber(cents) / 100;
  return dollars.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function PurchaseManagementPage() {
  const suppliersQuery = useSuppliersQuery();
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();

  const purchasesQuery = usePurchasesQuery();

  const createPurchase = useCreatePurchaseMutation();
  const updatePurchase = useUpdatePurchaseMutation();

  const suppliers = suppliersQuery.data || [];
  const inventoryItems = itemsQuery.data || [];
  const units = unitsQuery.data || [];

  const itemById = useMemo(
    () => new Map(inventoryItems.map((i) => [i.id, i])),
    [inventoryItems],
  );

  const [form, setForm] = useState({
    supplierId: "",
    taxCents: "0",
    notes: "",
    items: [
      {
        inventoryItemId: "",
        unitId: "",
        quantity: "",
        unitCostCents: "",
      },
    ],
  });

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
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { inventoryItemId: "", unitId: "", quantity: "", unitCostCents: "" },
      ],
    }));
  }

  function removeLine(idx) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
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

    setForm({
      supplierId: "",
      taxCents: "0",
      notes: "",
      items: [
        { inventoryItemId: "", unitId: "", quantity: "", unitCostCents: "" },
      ],
    });
  }

  const purchases = purchasesQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Purchase Management</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Create purchase orders and receive them into stock.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/suppliers">Suppliers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/dashboard">Inventory</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Create Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Supplier</div>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.supplierId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supplierId: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && !suppliersQuery.isLoading && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Add a supplier first.
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Tax (cents)</div>
                <Input
                  value={form.taxCents}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, taxCents: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Notes</div>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Line items</div>
              {form.items.map((line, idx) => {
                const selectedItem = itemById.get(line.inventoryItemId);
                const baseType = selectedItem?.baseUnit?.baseType;
                const allowedUnits = baseType
                  ? units.filter((u) => u.baseType === baseType)
                  : units;

                return (
                  <div
                    key={idx}
                    className="grid gap-2 rounded-lg border bg-card p-3 md:grid-cols-12"
                  >
                    <div className="md:col-span-4">
                      <div className="text-xs text-muted-foreground">Item</div>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        value={line.inventoryItemId}
                        onChange={(e) =>
                          setLine(idx, {
                            inventoryItemId: e.target.value,
                            unitId: "",
                          })
                        }
                      >
                        <option value="">Select…</option>
                        {inventoryItems.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.baseUnit?.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <div className="text-xs text-muted-foreground">Unit</div>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        value={line.unitId}
                        onChange={(e) =>
                          setLine(idx, { unitId: e.target.value })
                        }
                      >
                        <option value="">Select…</option>
                        {allowedUnits.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.symbol})
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Base type: {baseType || "—"}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground">Qty</div>
                      <Input
                        value={line.quantity}
                        onChange={(e) =>
                          setLine(idx, { quantity: e.target.value })
                        }
                        placeholder="e.g. 2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground">
                        Unit Cost (cents)
                      </div>
                      <Input
                        value={line.unitCostCents}
                        onChange={(e) =>
                          setLine(idx, { unitCostCents: e.target.value })
                        }
                        placeholder="e.g. 500"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeLine(idx)}
                        disabled={form.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={addLine}>
                  Add line
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  {createPurchase.isPending ? "Creating…" : "Create purchase"}
                </Button>
              </div>

              {(itemsQuery.isLoading ||
                unitsQuery.isLoading ||
                suppliersQuery.isLoading) && (
                <div className="text-xs text-muted-foreground">
                  Loading references…
                </div>
              )}
              {inventoryItems.length === 0 && !itemsQuery.isLoading && (
                <div className="text-xs text-muted-foreground">
                  Create inventory items before making purchases.
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchasesQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      No purchases yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 font-medium">
                        {p.supplier?.name || "—"}
                      </td>
                      <td className="py-2">{p.status}</td>
                      <td className="py-2 text-muted-foreground">
                        {formatMoneyFromCents(p.totalCents)}
                      </td>
                      <td className="py-2">
                        {p.status === "RECEIVED" ? (
                          <span className="text-xs text-muted-foreground">
                            Received{" "}
                            {p.receivedAt
                              ? new Date(p.receivedAt).toLocaleDateString()
                              : ""}
                          </span>
                        ) : p.status === "CANCELLED" ? (
                          <span className="text-xs text-muted-foreground">
                            Cancelled
                          </span>
                        ) : (
                          <Button
                            size="sm"
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
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Note: receiving a purchase writes inventory transactions and updates
            weighted average cost.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
