import React, { useMemo, useState } from "react";
import {
  useHousekeepingTasksQuery,
  useStartHousekeepingMutation,
  useCompleteHousekeepingMutation,
  useVerifyHousekeepingMutation,
  useCreateHousekeepingMutation,
  useRoomsQuery,
  useReservationsQuery,
  useDetectLateCheckoutsMutation,
} from "@/features/roomops/hooks/useRoomOps";
import {
  PageHeader,
  DataTable,
  DialogForm,
  FormSection,
  FormField,
  FormRow,
  StatusBadge,
  ChartWrapper,
  CHART_COLORS,
  KpiCard,
} from "@/components/ui/erp";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Plus, Play, Check, Eye } from "lucide-react";

export default function HousekeepingBoard() {
  const { data = [], isLoading } = useHousekeepingTasksQuery();
  const roomsQuery = useRoomsQuery();
  const reservationsQuery = useReservationsQuery();

  const createMut = useCreateHousekeepingMutation();
  const startMut = useStartHousekeepingMutation();
  const completeMut = useCompleteHousekeepingMutation();
  const verifyMut = useVerifyHousekeepingMutation();
  const detectMut = useDetectLateCheckoutsMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    roomId: "",
    reservationId: "",
    kind: "CLEANING",
    notes: "",
  });

  const counts = useMemo(() => {
    const map = { PENDING: 0, IN_PROGRESS: 0, CLEANED: 0, VERIFIED: 0 };
    (data || []).forEach((t) => {
      map[t.status] = (map[t.status] || 0) + 1;
    });
    return map;
  }, [data]);

  const pieData = useMemo(
    () =>
      Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0),
    [counts],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "room",
        header: "Room",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              Room {row.original.room?.roomNumber ?? row.original.roomId}
            </div>
            {row.original.room?.floor ? (
              <div className="text-xs text-muted-foreground">
                Floor {row.original.room.floor}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "reservation",
        header: "Reservation",
        cell: ({ row }) =>
          row.original.reservation ? (
            <div>
              <div className="font-medium">
                {row.original.reservation.guestName}
              </div>
              <div className="text-xs text-muted-foreground">
                {row.original.reservation.status}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "kind",
        header: "Kind",
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue()} label={getValue()} />
        ),
      },
      {
        id: "assigned",
        header: "Assigned",
        cell: ({ row }) =>
          row.original.assignedUser?.name ||
          row.original.assignedUser?.email ||
          "—",
      },
      {
        id: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg"
                onClick={() => {
                  setSelectedTask(t);
                  setViewOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
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
              {t.status === "CLEANED" ? (
                <Button
                  size="sm"
                  className="rounded-lg"
                  onClick={() => verifyMut.mutate(t.id)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [startMut, completeMut, verifyMut],
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Task
      </Button>
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => detectMut.mutate()}
        disabled={detectMut.isPending}
      >
        {detectMut.isPending ? "Detecting…" : "Detect late checkouts"}
      </Button>
    </div>
  );

  const onCreateSubmit = async () => {
    if (!form.roomId) return;
    await createMut.mutateAsync({
      roomId: form.roomId,
      reservationId: form.reservationId || null,
      kind: form.kind,
      notes: form.notes || null,
    });
    setForm({ roomId: "", reservationId: "", kind: "CLEANING", notes: "" });
    setCreateOpen(false);
  };

  return (
    <div className="p-6">
      <PageHeader title="Housekeeping" subtitle="Board" />

      {/* Main Layout Container (Now vertically stacked using full width) */}
      <div className="mt-4 space-y-6">
        {/* 1. KPI Boxes in a horizontal row spanning full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KpiCard
            label="Pending"
            value={counts.PENDING}
            accent="amber"
            loading={isLoading}
          />
          <KpiCard
            label="In progress"
            value={counts.IN_PROGRESS}
            accent="cyan"
            loading={isLoading}
          />
          <KpiCard
            label="Verified"
            value={counts.VERIFIED}
            accent="emerald"
            loading={isLoading}
          />
        </div>

        {/* 2. Data Table spanning full width */}
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          searchPlaceholder="Search tasks…"
          toolbar={toolbar}
          pageSize={12}
          emptyTitle="No housekeeping tasks"
          emptyDescription="Create a task to get started."
        />

        {/* 3. Status Distribution Chart spanning full width underneath the table */}
        <div className="rounded-2xl border bg-card p-4">
          <h4 className="text-sm font-semibold">Status distribution</h4>
          <div className="mt-3">
            <ChartWrapper height={220} empty={pieData.length === 0}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        CHART_COLORS.palette[i % CHART_COLORS.palette.length]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartWrapper>
          </div>
        </div>
      </div>

      {/* Dialog Components */}
      <DialogForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create housekeeping task"
        description="Assign a room and optionally link a reservation."
        onSubmit={onCreateSubmit}
        submitLabel="Create task"
        loading={createMut.isPending || createMut.isLoading}
        size="lg"
      >
        <FormSection title="Task details">
          <FormField label="Room" fullWidth>
            <Select
              value={form.roomId}
              onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room…" />
              </SelectTrigger>
              <SelectContent>
                {(roomsQuery.data || []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {`#${r.roomNumber} ${r.floor ? `— Floor ${r.floor}` : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Reservation (optional)" fullWidth>
            <Select
              value={form.reservationId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, reservationId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reservation…" />
              </SelectTrigger>
              <SelectContent>
                {(reservationsQuery.data || []).map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.guestName
                      ? `${res.guestName} — ${res.room?.roomNumber ?? res.roomId}`
                      : String(res.id).slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormRow>
            <FormField label="Kind">
              <Select
                value={form.kind}
                onValueChange={(v) => setForm((f) => ({ ...f, kind: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLEANING">CLEANING</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                  <SelectItem value="INSPECTION">INSPECTION</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </FormField>
          </FormRow>
        </FormSection>
      </DialogForm>

      <DialogForm
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Task details"
        onSubmit={() => setViewOpen(false)}
        submitLabel="Close"
      >
        <FormSection>
          {selectedTask ? (
            <div>
              <p className="text-sm">
                <strong>Room:</strong>{" "}
                {selectedTask.room?.roomNumber ?? selectedTask.roomId}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <StatusBadge
                  status={selectedTask.status}
                  label={selectedTask.status}
                />
              </p>
              <p className="text-sm">
                <strong>Kind:</strong> {selectedTask.kind}
              </p>
              <p className="text-sm">
                <strong>Assigned:</strong>{" "}
                {selectedTask.assignedUser?.name ||
                  selectedTask.assignedUser?.email ||
                  "—"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedTask.notes || "No notes"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No task selected</p>
          )}
        </FormSection>
      </DialogForm>
    </div>
  );
}
