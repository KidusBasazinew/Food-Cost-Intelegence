import React, { useMemo, useState } from "react";
import {
  PageShell,
  PageHeader,
  FormRow,
  KpiGrid,
  KpiCard,
  DataTable,
  DialogForm,
  FormSection,
  FormField,
} from "@/components/ui/erp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import {
  useEmployeesQuery,
  useCreateEmployeeMutation,
  useResetPinMutation,
  useUpdateEmployeeMutation,
  useDisableEmployeeMutation,
  useShiftsQuery,
  useCreateShiftMutation,
} from "@/features/workforce/hooks/useWorkforce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function maskPin(pin) {
  if (!pin) return "—";
  return "●".repeat(Math.min(pin.length, 4));
}

export default function EmployeesPage() {
  const q = useEmployeesQuery();
  const createMut = useCreateEmployeeMutation();
  const updateMut = useUpdateEmployeeMutation();
  const resetMut = useResetPinMutation();
  const disableMut = useDisableEmployeeMutation();

  const shiftsQuery = useShiftsQuery();
  const createShiftMut = useCreateShiftMutation();
  const shifts = shiftsQuery.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [shiftDialog, setShiftDialog] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [form, setForm] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    role: "OTHER",
    phone: "",
    pinCode: "",
    shiftId: "",
  });
  const [shiftForm, setShiftForm] = useState({
    name: "",
    startTime: "08:00",
    endTime: "17:00",
    graceMinutes: 10,
    color: "#22c55e",
  });

  const totalEmployees = q.data?.length ?? 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Employee Code",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.employeeCode}</div>
        ),
      },
      {
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      { accessorKey: "role", header: "Role" },
      {
        accessorKey: "phone",
        header: "Phone/Email",
        cell: ({ row }) => row.original.phone || "—",
      },
      {
        accessorKey: "shift",
        header: "Shift",
        cell: ({ row }) => {
          const shift = row.original.shift;

          return shift
            ? `${shift.name} (${shift.startTime}-${shift.endTime})`
            : "No shift";
        },
      },
      // {
      //   accessorKey: "isActive",
      //   header: "Status",
      //   cell: ({ row }) => (
      //     <Badge variant={row.original.isActive ? "default" : "secondary"}>
      //       {row.original.isActive ? "Active" : "Inactive"}
      //     </Badge>
      //   ),
      // },
      // {
      //   accessorKey: "pinCode",
      //   header: "PIN",
      //   cell: ({ row }) => maskPin(row.original.pinCode),
      // },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelected(row.original);
                setForm({
                  employeeCode: row.original.employeeCode,
                  firstName: row.original.firstName,
                  lastName: row.original.lastName,
                  role: row.original.role,
                  phone: row.original.phone || "",
                  pinCode: "",
                });
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
            {row.original.isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (
                    window.confirm(
                      `Disable ${row.original.firstName} ${row.original.lastName}?`,
                    )
                  ) {
                    await disableMut.mutateAsync(row.original.id);
                  }
                }}
              >
                Disable
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setResetTarget(row.original);
                setNewPin("");
                setResetDialogOpen(true);
              }}
            >
              Reset PIN
            </Button>
          </div>
        ),
      },
    ],
    [disableMut],
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => {
          setSelected(null);
          setShiftForm({
            name: "",
            startTime: "08:00",
            endTime: "17:00",
          });
          setShiftDialog(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Shift
      </Button>
      <Button
        variant="secondary"
        className="rounded-xl"
        onClick={() => {
          setSelected(null);
          setForm({
            employeeCode: "",
            firstName: "",
            lastName: "",
            role: "OTHER",
            phone: "",
            pinCode: "",
          });
          setDialogOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Employee
      </Button>
    </div>
  );

  async function onSubmit() {
    const payload = {
      employeeCode: form.employeeCode,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      phone: form.phone || undefined,
      pinCode: form.pinCode || undefined,
      shiftId: form.shiftId || null,
    };
    if (selected) {
      await updateMut.mutateAsync({ id: selected.id, input: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    setDialogOpen(false);
    setSelected(null);
  }

  async function onResetPin() {
    if (!resetTarget || !newPin) return;
    await resetMut.mutateAsync({ id: resetTarget.id, newPin });
    setResetDialogOpen(false);
    setResetTarget(null);
    setNewPin("");
  }

  return (
    <PageShell>
      <PageHeader
        title="Employees"
        subtitle="Manage workforce profiles and PINs"
      />
      <KpiGrid cols={3}>
        <KpiCard
          label="Total employees"
          value={totalEmployees}
          hint="Overall staff directory size"
          icon={Users}
          accent="blue"
          loading={q.isLoading || q.isPending}
        />
        <KpiCard
          label="Active"
          value={q.data?.filter((e) => e.isActive).length ?? "—"}
          hint="Currently active roster"
          icon={UserCheck}
          accent="emerald"
          loading={q.isLoading || q.isPending}
        />
        <KpiCard
          label="Inactive"
          value={q.data?.filter((e) => !e.isActive).length ?? "—"}
          hint="Suspended or off-boarded staff"
          icon={UserX}
          accent="rose"
          loading={q.isLoading || q.isPending}
        />
      </KpiGrid>
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={q.data || []}
          loading={q.isLoading}
          toolbar={toolbar}
          pageSize={12}
          emptyTitle="No employees"
          emptyDescription="Create an employee to get started."
        />
      </div>
      <DialogForm
        open={shiftDialog}
        onOpenChange={setShiftDialog}
        title="Create Shift"
        description="Create employee working schedule"
        submitLabel="Create Shift"
        onSubmit={async () => {
          await createShiftMut.mutateAsync({
            name: shiftForm.name,
            startTime: shiftForm.startTime,
            endTime: shiftForm.endTime,
            graceMinutes: Number(shiftForm.graceMinutes),
            color: shiftForm.color,
          });
          setShiftDialog(false);
        }}
      >
        <FormSection title="Shift details">
          <FormField label="Name" fullWidth>
            <Input
              value={shiftForm.name}
              onChange={(e) =>
                setShiftForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Start time">
            <Input
              type="time"
              value={shiftForm.startTime}
              onChange={(e) =>
                setShiftForm((f) => ({ ...f, startTime: e.target.value }))
              }
            />
          </FormField>
          <FormField label="End time">
            <Input
              type="time"
              value={shiftForm.endTime}
              onChange={(e) =>
                setShiftForm((f) => ({ ...f, endTime: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Grace minutes">
            <Input
              type="number"
              value={shiftForm.graceMinutes}
              onChange={(e) =>
                setShiftForm((f) => ({
                  ...f,
                  graceMinutes: e.target.value,
                }))
              }
            />
          </FormField>
          <FormRow>
            <FormField label="Color">
              <Input
                type="color"
                value={shiftForm.color}
                onChange={(e) =>
                  setShiftForm((f) => ({
                    ...f,
                    color: e.target.value,
                  }))
                }
              />
            </FormField>
          </FormRow>
        </FormSection>
      </DialogForm>

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit employee" : "Create employee"}
        description="Manage employee profiles, roles, and authorization details."
        onSubmit={onSubmit}
        submitLabel={selected ? "Save" : "Create"}
        loading={createMut.isPending || updateMut.isPending}
        size="lg"
      >
        <FormSection title="Employee details">
          <FormField label="Employee code" fullWidth>
            <Input
              value={form.employeeCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, employeeCode: e.target.value }))
              }
              placeholder="e.g. EMP-001"
              disabled={!!selected}
            />
          </FormField>
          <FormRow>
            <FormField label="First name">
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                placeholder="First name"
              />
            </FormField>
            <FormField label="Last name">
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                placeholder="Last name"
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="Phone number"
              />
            </FormField>
            <FormField label="Role">
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSEKEEPING">HOUSEKEEPING</SelectItem>
                  <SelectItem value="RECEPTION">RECEPTION</SelectItem>
                  <SelectItem value="CHEF">CHEF</SelectItem>
                  <SelectItem value="WAITER">WAITER</SelectItem>
                  <SelectItem value="CASHIER">CASHIER</SelectItem>
                  <SelectItem value="STORE_KEEPER">STORE_KEEPER</SelectItem>
                  <SelectItem value="SECURITY">SECURITY</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Shift">
              <Select
                value={form.shiftId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    shiftId: v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}({shift.startTime} - {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormRow>
          <FormField label="PIN" fullWidth>
            <Input
              type="password"
              value={form.pinCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, pinCode: e.target.value }))
              }
              placeholder={
                selected ? "Leave blank to keep current PIN" : "4-digit PIN"
              }
            />
          </FormField>
        </FormSection>
      </DialogForm>

      <DialogForm
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Reset PIN"
        description={`Set a new PIN for ${resetTarget?.firstName ?? ""} ${resetTarget?.lastName ?? ""}`}
        onSubmit={onResetPin}
        submitLabel="Reset PIN"
        loading={resetMut.isPending}
      >
        <FormField label="New PIN" fullWidth>
          <Input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Enter new PIN"
          />
        </FormField>
      </DialogForm>
    </PageShell>
  );
}
