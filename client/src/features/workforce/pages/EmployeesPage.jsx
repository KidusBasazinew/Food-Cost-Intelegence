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
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import {
  useEmployeesQuery,
  useCreateEmployeeMutation,
  useResetPinMutation,
  useUpdateEmployeeMutation,
} from "@/features/workforce/hooks/useWorkforce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function EmployeesPage() {
  const q = useEmployeesQuery();
  const createMut = useCreateEmployeeMutation();
  const updateMut = useUpdateEmployeeMutation?.() ?? {
    mutateAsync: async () => {},
  };
  const resetMut = useResetPinMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    role: "OTHER",
    pinCode: "",
  });

  const totalEmployees = q.data?.length ?? 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Code",
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
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
                  pinCode: "",
                });
                setDialogOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                const newPin = prompt("Enter new PIN:");
                if (newPin)
                  await resetMut.mutateAsync({ id: row.original.id, newPin });
              }}
            >
              Reset PIN
            </Button>
          </div>
        ),
      },
    ],
    [resetMut],
  );

  const toolbar = (
    <div className="flex items-center gap-2">
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
      pinCode: form.pinCode,
    };
    if (selected) {
      await updateMut.mutateAsync({ id: selected.id, input: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    setDialogOpen(false);
    setSelected(null);
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
      </KpiGrid>{" "}
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selected ? "Edit employee" : "Create employee"}
        description="Manage employee profiles, roles, and authorization details."
        onSubmit={onSubmit}
        submitLabel={selected ? "Save" : "Create"}
        loading={
          createMut?.isPending ||
          createMut?.isLoading ||
          updateMut?.isPending ||
          updateMut?.isLoading
        }
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

            <FormField label="PIN">
              <Input
                type="password"
                value={form.pinCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pinCode: e.target.value }))
                }
                placeholder="4-digit entry pin"
              />
            </FormField>
          </FormRow>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
