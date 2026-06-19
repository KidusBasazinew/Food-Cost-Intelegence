import React, { useState } from "react";
import {
  useHousekeepingTasksQuery,
  useStartHousekeepingMutation,
  useCompleteHousekeepingMutation,
} from "@/features/roomops/hooks/useRoomOps";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/erp";
import { Play, Check } from "lucide-react";

export default function CleanerMobileView() {
  const [status, setStatus] = useState("PENDING");
  const { data = [], isLoading } = useHousekeepingTasksQuery({ status });
  const startMut = useStartHousekeepingMutation();
  const completeMut = useCompleteHousekeepingMutation();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cleaner Mobile</h2>
        <div className="inline-flex rounded-xl border bg-muted/10 p-1">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${status === "PENDING" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setStatus("PENDING")}
          >
            Pending
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${status === "IN_PROGRESS" ? "bg-primary/10 text-primary" : ""}`}
            onClick={() => setStatus("IN_PROGRESS")}
          >
            In progress
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks</p>
        ) : (
          data.map((t) => (
            <div key={t.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">
                    Room {t.room?.roomNumber ?? t.roomId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.kind} —{" "}
                    <StatusBadge status={t.status} label={t.status} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {t.status === "PENDING" ? (
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => startMut.mutate(t.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  ) : null}
                  {t.status === "IN_PROGRESS" ? (
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => completeMut.mutate(t.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
