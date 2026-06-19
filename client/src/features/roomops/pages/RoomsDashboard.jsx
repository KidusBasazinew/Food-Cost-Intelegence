import React, { useMemo, useState } from "react";
import {
  useRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
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
  KpiGrid,
} from "@/components/ui/erp";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Plus, Edit, Trash2, DoorOpen, Bed, Sparkles } from "lucide-react";

export default function RoomsDashboard() {
  const { data = [], isLoading } = useRoomsQuery();
  const createMut = useCreateRoomMutation();
  const updateMut = useUpdateRoomMutation();
  const deleteMut = useDeleteRoomMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    roomNumber: "",
    floor: "",
    status: "VACANT",
    isActive: "true",
  });

  const counts = useMemo(() => {
    const map = {
      VACANT: 0,
      OCCUPIED: 0,
      DIRTY: 0,
      CLEANING: 0,
      INSPECTING: 0,
      READY: 0,
      OUT_OF_SERVICE: 0,
    };
    (data || []).forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
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
        accessorKey: "roomNumber",
        header: "Room",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.roomNumber}</div>
        ),
      },
      {
        accessorKey: "floor",
        header: "Floor",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue()} label={getValue()} />
        ),
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ getValue }) => (String(getValue()) === "true" ? "Yes" : "No"),
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
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg"
              onClick={() => {
                setSelected(row.original);
                setForm({
                  roomNumber: row.original.roomNumber,
                  floor: row.original.floor ?? "",
                  status: row.original.status,
                  isActive: String(row.original.isActive),
                });
                setDialogOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-lg"
              onClick={() => {
                if (confirm("Delete room?")) deleteMut.mutate(row.original.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMut],
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => {
          setSelected(null);
          setForm({
            roomNumber: "",
            floor: "",
            status: "VACANT",
            isActive: "true",
          });
          setDialogOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Room
      </Button>
    </div>
  );

  const onSubmit = async () => {
    const payload = {
      roomNumber: form.roomNumber,
      floor: form.floor ? Number(form.floor) : null,
      status: form.status,
      isActive: form.isActive === "true",
    };
    if (selected) {
      await updateMut.mutateAsync({ id: selected.id, input: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    setDialogOpen(false);
    setSelected(null);
  };

  return (
    <div className="p-6">
      <PageHeader title="Rooms" subtitle="Rooms dashboard" />

      {/* Main Layout Container (Vertically stacked using full width) */}
      <div className="mt-4 space-y-6">
        {/* 1. KPI Boxes displayed in a horizontal row on top spanning full width */}

        <KpiGrid cols={3}>
          <KpiCard
            label="Vacant rooms"
            value={counts.VACANT}
            hint="Available for immediate check-in"
            icon={DoorOpen}
            accent="purple"
            loading={isLoading}
          />

          <KpiCard
            label="Occupied rooms"
            value={counts.OCCUPIED}
            hint="Active guest stays"
            icon={Bed}
            accent="emerald"
            loading={isLoading}
            // Optional trend formatting matching your manual:
            // trend={5}
            // trendLabel="↑ vs yesterday"
          />

          <KpiCard
            label="Dirty rooms"
            value={counts.DIRTY}
            hint="Awaiting housekeeping attention"
            icon={Sparkles}
            accent="amber"
            loading={isLoading}
          />
        </KpiGrid>
        {/* 2. Data Table spanning full width */}
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          toolbar={toolbar}
          pageSize={12}
          emptyTitle="No rooms"
          emptyDescription="Create a room to get started."
        />

        {/* 3. Status Distribution Chart at the very bottom spanning full width */}
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

      {/* Dialog Form */}
      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit room" : "Create room"}
        description="Define room number, floor and status."
        onSubmit={onSubmit}
        submitLabel={selected ? "Save" : "Create"}
        loading={
          createMut.isPending ||
          createMut.isLoading ||
          updateMut.isPending ||
          updateMut.isLoading
        }
        size="lg"
      >
        <FormSection title="Room details">
          <FormField label="Room number" fullWidth>
            <Input
              value={form.roomNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, roomNumber: e.target.value }))
              }
              placeholder="e.g. 101A"
            />
          </FormField>

          <FormRow>
            <FormField label="Floor">
              <Input
                type="number"
                value={form.floor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, floor: e.target.value }))
                }
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACANT">VACANT</SelectItem>
                  <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                  <SelectItem value="DIRTY">DIRTY</SelectItem>
                  <SelectItem value="CLEANING">CLEANING</SelectItem>
                  <SelectItem value="INSPECTING">INSPECTING</SelectItem>
                  <SelectItem value="READY">READY</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">OUT_OF_SERVICE</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>

          <FormField label="Active" fullWidth>
            <Select
              value={form.isActive}
              onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>
      </DialogForm>
    </div>
  );
}
