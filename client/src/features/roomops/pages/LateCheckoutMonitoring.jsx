import React, { useMemo } from "react";
import {
  useLateCheckoutsQuery,
  useDetectLateCheckoutsMutation,
} from "@/features/roomops/hooks/useRoomOps";
import { PageHeader, DataTable, KpiCard } from "@/components/ui/erp";
import { Button } from "@/components/ui/button";

export default function LateCheckoutMonitoring() {
  const { data = [], isLoading } = useLateCheckoutsQuery();
  const detect = useDetectLateCheckoutsMutation();

  const total = useMemo(
    () => (data || []).reduce((s, r) => s + (r.fee || 0), 0),
    [data],
  );

  const columns = [
    {
      accessorKey: "reservationId",
      header: "Reservation",
      cell: ({ row }) =>
        row.original.reservationId ? (
          <a
            className="text-primary hover:underline"
            href={`/ops/reservations/${row.original.reservationId}`}
          >
            {String(row.original.reservationId).slice(0, 8)}
          </a>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "fee",
      header: "Fee applied",
      cell: ({ row }) =>
        row.original.fee
          ? (row.original.fee / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "ETB",
            })
          : "—",
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Late Checkouts"
        subtitle="Monitor and process overdue checkouts"
      />

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="secondary"
          className="rounded-xl"
          onClick={() => detect.mutate()}
        >
          {detect.isPending ? "Detecting…" : "Run detection"}
        </Button>
        <KpiCard
          label="Fees applied"
          value={(total / 100).toLocaleString(undefined, {
            style: "currency",
            currency: "ETB",
          })}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          emptyTitle="No late checkouts"
          emptyDescription="No overdue reservations detected."
          pageSize={12}
        />
      </div>
    </div>
  );
}
