import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useInventoryTransactionsQuery } from "@/features/inventory/hooks/useInventoryItems";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function InventoryTransactionsPage() {
  const txnsQuery = useInventoryTransactionsQuery();
  const txns = txnsQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Inventory Transactions</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Purchases, adjustments, waste, and transfers.
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link to="/inventory/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Base Qty</th>
                  <th className="py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {txnsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : txns.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  txns.map((t) => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2">
                        <Link
                          className="font-medium hover:underline"
                          to={`/inventory/items/${t.inventoryItem?.id}`}
                        >
                          {t.inventoryItem?.name || "—"}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          Base: {t.inventoryItem?.baseUnit?.symbol}
                        </div>
                      </td>
                      <td className="py-2">{t.type}</td>
                      <td className="py-2">
                        {toNumber(t.quantity).toLocaleString()} {t.unit?.symbol}
                      </td>
                      <td className="py-2">
                        {toNumber(t.quantityInBaseUnit).toLocaleString()}{" "}
                        {t.inventoryItem?.baseUnit?.symbol}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {t.totalCostCents == null
                          ? "—"
                          : (toNumber(t.totalCostCents) / 100).toLocaleString(
                              undefined,
                              {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 2,
                              },
                            )}
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
