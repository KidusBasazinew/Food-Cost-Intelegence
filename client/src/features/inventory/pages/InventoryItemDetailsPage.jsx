import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreateInventoryTransactionMutation,
  useInventoryItemQuery,
  useInventoryTransactionsQuery,
} from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function InventoryItemDetailsPage() {
  const { id } = useParams();

  const itemQuery = useInventoryItemQuery(id);
  const unitsQuery = useMeasurementUnitsQuery();

  const txnsQuery = useInventoryTransactionsQuery(
    { inventoryItemId: id },
    { enabled: Boolean(id) },
  );

  const createTxn = useCreateInventoryTransactionMutation();

  const item = itemQuery.data;

  const allowedUnits = useMemo(() => {
    const units = unitsQuery.data || [];
    if (!item?.baseUnit?.baseType) return units;
    return units.filter((u) => u.baseType === item.baseUnit.baseType);
  }, [unitsQuery.data, item?.baseUnit?.baseType]);

  const [form, setForm] = useState({
    type: "ADJUSTMENT",
    quantity: "",
    unitId: "",
    unitCostCents: "",
    note: "",
  });

  const canSubmit =
    Boolean(id) &&
    form.type &&
    form.quantity.trim() &&
    form.unitId &&
    !createTxn.isPending;

  async function onSubmit(e) {
    e.preventDefault();
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
  }

  const txns = txnsQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Item Details</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {item ? item.name : "Loading…"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/inventory/items">Back to items</Link>
          </Button>
          <Button asChild>
            <Link to="/inventory/transactions">All transactions</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          {!item ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">In Stock</div>
                <div className="text-lg font-semibold">
                  {toNumber(item.quantityInStock).toLocaleString()}{" "}
                  {item.baseUnit?.symbol}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Min Stock</div>
                <div className="text-lg font-semibold">
                  {toNumber(item.minimumStockLevel).toLocaleString()}{" "}
                  {item.baseUnit?.symbol}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Avg Cost / Base
                </div>
                <div className="text-lg font-semibold">
                  {(
                    toNumber(item.averageCostPerBaseUnitCents) / 100
                  ).toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Category</div>
                <div className="text-lg font-semibold">{item.category}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Log Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6">
            <div>
              <div className="text-xs text-muted-foreground">Type</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="ADJUSTMENT">Adjustment (+/-)</option>
                <option value="WASTE">Waste (-)</option>
                <option value="CONSUMPTION">Consumption (-)</option>
                <option value="TRANSFER">Transfer (-)</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Quantity</div>
              <Input
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder={
                  form.type === "ADJUSTMENT" ? "e.g. 5 or -5" : "e.g. 5"
                }
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Unit</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.unitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitId: e.target.value }))
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
                Must match base type: {item?.baseUnit?.baseType || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Unit Cost (cents)
              </div>
              <Input
                value={form.unitCostCents}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitCostCents: e.target.value }))
                }
                placeholder="optional"
              />
            </div>

            <div className="md:col-span-6">
              <div className="text-xs text-muted-foreground">Note</div>
              <Input
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Optional context"
              />
            </div>

            <div className="md:col-span-6">
              <Button type="submit" disabled={!canSubmit}>
                {createTxn.isPending ? "Saving…" : "Create transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Base Qty</th>
                  <th className="py-2">Ref</th>
                </tr>
              </thead>
              <tbody>
                {txnsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : txns.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  txns.slice(0, 25).map((t) => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2">{t.type}</td>
                      <td className="py-2">
                        {toNumber(t.quantity).toLocaleString()} {t.unit?.symbol}
                      </td>
                      <td className="py-2">
                        {toNumber(t.quantityInBaseUnit).toLocaleString()}{" "}
                        {item?.baseUnit?.symbol}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {t.referenceType
                          ? `${t.referenceType}:${String(t.referenceId).slice(0, 8)}`
                          : "—"}
                      </td>
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
