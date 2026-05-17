import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Low Stock Alerts</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Items at or below minimum stock.
          </div>
        </div>
        <Button asChild variant="secondary">
          <Link to="/inventory/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Min</th>
                  <th className="py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {itemsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={4}>
                      No low stock items.
                    </td>
                  </tr>
                ) : (
                  items.map((i) => (
                    <tr key={i.id} className="border-b last:border-b-0">
                      <td className="py-2">
                        <Link
                          className="font-medium hover:underline"
                          to={`/inventory/items/${i.id}`}
                        >
                          {i.name}
                        </Link>
                      </td>
                      <td className="py-2">
                        {toNumber(i.quantityInStock).toLocaleString()}{" "}
                        {i.baseUnit?.symbol}
                      </td>
                      <td className="py-2">
                        {toNumber(i.minimumStockLevel).toLocaleString()}{" "}
                        {i.baseUnit?.symbol}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {i.category}
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
