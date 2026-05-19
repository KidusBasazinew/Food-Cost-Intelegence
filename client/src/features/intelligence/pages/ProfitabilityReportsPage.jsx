import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useFoodCostReportQuery } from "@/features/intelligence/hooks/useFoodCost";

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

export function ProfitabilityReportsPage() {
  const reportQuery = useFoodCostReportQuery({ status: "ACTIVE" });
  const recipes = reportQuery.data || [];

  const sorted = useMemo(() => {
    return [...recipes].sort(
      (a, b) =>
        toNumber(b.estimatedProfitMargin) - toNumber(a.estimatedProfitMargin),
    );
  }, [recipes]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">Profitability Reports</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Most profitable meals, low margin meals, and loss-making items.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Profitability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Recipe</th>
                  <th className="py-2">Cost</th>
                  <th className="py-2">Selling</th>
                  <th className="py-2">Profit</th>
                  <th className="py-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={5}>
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  sorted.map((r) => {
                    const margin = toNumber(r.estimatedProfitMargin);
                    const loss = toNumber(r.estimatedProfitCents) < 0;

                    return (
                      <tr key={r.id} className="border-b last:border-b-0">
                        <td className="py-2 font-medium">{r.name}</td>
                        <td className="py-2">
                          {formatMoney(r.totalCostCents)}
                        </td>
                        <td className="py-2">
                          {formatMoney(r.sellingPriceCents)}
                        </td>
                        <td className="py-2">
                          <span className={loss ? "text-destructive" : ""}>
                            {formatMoney(r.estimatedProfitCents)}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={
                              loss
                                ? "text-destructive"
                                : margin < 10
                                  ? "text-amber-600"
                                  : ""
                            }
                          >
                            {margin.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                            %
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
