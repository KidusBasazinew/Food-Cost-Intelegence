import React, { useMemo, useState } from "react";
import {
  useReservationsQuery,
  useCreateReservationMutation,
  useCheckInReservationMutation,
  useCheckOutReservationMutation,
  useRoomsQuery,
} from "@/features/roomops/hooks/useRoomOps";
import {
  PageHeader,
  DataTable,
  DialogForm,
  FormSection,
  FormField,
  FormRow,
  StatusBadge,
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
import { Plus, CalendarDays, BookmarkCheck, UserCheck } from "lucide-react";

export default function ReservationsPage() {
  const { data = [], isLoading } = useReservationsQuery();
  const roomsQuery = useRoomsQuery();
  const createMut = useCreateReservationMutation();
  const checkInMut = useCheckInReservationMutation();
  const checkOutMut = useCheckOutReservationMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    roomId: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    checkInAt: "",
    checkOutAt: "",
    notes: "",
  });

  const totals = useMemo(() => {
    const t = { total: 0, reserved: 0, checkedIn: 0 };
    (data || []).forEach((r) => {
      t.total += 1;
      if (r.status === "RESERVED") t.reserved += 1;
      if (r.status === "CHECKED_IN") t.checkedIn += 1;
    });
    return t;
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "guestName",
        header: "Guest",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.guestName}</div>
        ),
      },
      {
        accessorKey: "roomId",
        header: "Room",
        cell: ({ row }) => {
          const reservation = row.original;

          // 1. Look up the matching room from the rooms list query using roomId
          const matchingRoom = (roomsQuery.data || []).find(
            (room) => room.id === reservation.roomId,
          );

          // 2. If we can't find a matching room object yet, fall back safely
          if (!matchingRoom) return "—";

          // 3. Return the room number and floor formatted exactly how you had it
          return (
            <div className="font-medium">
              {`Room ${matchingRoom.roomNumber}${
                matchingRoom.floor != null ? ` Floor ${matchingRoom.floor}` : ""
              }`}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue()} label={getValue()} />
        ),
      },
      {
        accessorKey: "checkInAt",
        header: "Check-in",
        cell: ({ row }) =>
          row.original.checkInAt
            ? new Date(row.original.checkInAt).toLocaleString()
            : "—",
      },
      {
        accessorKey: "checkOutAt",
        header: "Check-out",
        cell: ({ row }) =>
          row.original.checkOutAt
            ? new Date(row.original.checkOutAt).toLocaleString()
            : "—",
      },
      {
        id: "lateFee",
        header: "Late fee",
        cell: ({ row }) =>
          row.original.lateCheckoutFeeCents
            ? (row.original.lateCheckoutFeeCents / 100).toLocaleString(
                undefined,
                { style: "currency", currency: "ETB" },
              )
            : "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex gap-2">
              {r.status !== "CHECKED_IN" ? (
                <Button
                  size="sm"
                  className="rounded-lg"
                  onClick={() => checkInMut.mutate(r.id)}
                >
                  Check in
                </Button>
              ) : null}
              {r.status === "CHECKED_IN" ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-lg"
                  onClick={() => checkOutMut.mutate(r.id)}
                >
                  Check out
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [checkInMut, checkOutMut],
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Reservation
      </Button>
    </div>
  );

  const onSubmit = async () => {
    const payload = {
      roomId: form.roomId,
      guestName: form.guestName,
      guestPhone: form.guestPhone || null,
      guestEmail: form.guestEmail || null,
      checkInAt: form.checkInAt ? new Date(form.checkInAt).toISOString() : null,
      checkOutAt: form.checkOutAt
        ? new Date(form.checkOutAt).toISOString()
        : null,
      notes: form.notes || null,
    };
    await createMut.mutateAsync(payload);
    setForm({
      roomId: "",
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      checkInAt: "",
      checkOutAt: "",
      notes: "",
    });
    setDialogOpen(false);
  };

  return (
    <div className="p-6">
      <PageHeader title="Reservations" subtitle="Manage reservations" />

      {/* Main Layout Container (Vertically stacked using full width) */}
      <div className="mt-4 space-y-6">
        {/* 1. KPI Boxes displayed in a horizontal row on top spanning full width */}
        <KpiGrid cols={3}>
          <KpiCard
            label="Total bookings"
            value={totals.total}
            hint="Overall reservation footprint"
            icon={CalendarDays}
            accent="blue"
            loading={isLoading}
          />

          <KpiCard
            label="Reserved"
            value={totals.reserved}
            hint="Upcoming scheduled arrivals"
            icon={BookmarkCheck}
            accent="amber"
            loading={isLoading}
          />

          <KpiCard
            label="Checked in"
            value={totals.checkedIn}
            hint="Currently active in-house guests"
            icon={UserCheck}
            accent="emerald"
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
          emptyTitle="No reservations"
          emptyDescription="Create a reservation to get started."
        />
      </div>

      {/* Dialog Form */}
      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create reservation"
        description="Assign a guest to a room."
        onSubmit={onSubmit}
        submitLabel="Create"
        loading={createMut.isPending || createMut.isLoading}
        size="lg"
      >
        <FormSection title="Reservation">
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
                  <SelectItem
                    key={r.id}
                    value={r.id}
                  >{`#${r.roomNumber} ${r.floor ? `— Floor ${r.floor}` : ""}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormRow>
            <FormField label="Guest name">
              <Input
                value={form.guestName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestName: e.target.value }))
                }
              />
            </FormField>

            <FormField label="Phone">
              <Input
                value={form.guestPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestPhone: e.target.value }))
                }
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Email">
              <Input
                type="email"
                value={form.guestEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guestEmail: e.target.value }))
                }
              />
            </FormField>

            <FormField label="Notes">
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Check-in">
              <Input
                type="datetime-local"
                value={form.checkInAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkInAt: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Check-out">
              <Input
                type="datetime-local"
                value={form.checkOutAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkOutAt: e.target.value }))
                }
              />
            </FormField>
          </FormRow>
        </FormSection>
      </DialogForm>
    </div>
  );
}
