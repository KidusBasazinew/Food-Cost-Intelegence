import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useReportsListQuery } from "@/features/analytics/hooks/useReports";
import { reportsApi } from "@/features/analytics/api/reportsApi";
import {
  isoEndOfDay,
  isoStartOfDay,
  daysAgoISODate,
  todayISODate,
} from "@/features/analytics/utils/dates";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const q = useReportsListQuery();
  const reports = q.data || [];

  const [fromDate, setFromDate] = useState(daysAgoISODate(30));
  const [toDate, setToDate] = useState(todayISODate());
  const [format, setFormat] = useState("csv");
  const [busy, setBusy] = useState(false);

  const params = useMemo(
    () => ({ from: isoStartOfDay(fromDate), to: isoEndOfDay(toDate) }),
    [fromDate, toDate],
  );

  async function onExport(type) {
    setBusy(true);
    try {
      const blob = await reportsApi.export({ type, format, params });
      downloadBlob(blob, `${type}.${format}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium">Reports</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Export ERP-grade food operations reports to CSV, Excel, or PDF.
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">
              From
            </div>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">To</div>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Format
            </div>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No reports configured.
          </div>
        ) : (
          reports.map((r) => (
            <Card key={r.type}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{r.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {r.description}
                </div>
                <Button
                  type="button"
                  onClick={() => onExport(r.type)}
                  disabled={busy}
                >
                  Export {format.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
