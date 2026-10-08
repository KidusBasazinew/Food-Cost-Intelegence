import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateSupplierMutation,
  useSuppliersQuery,
} from "@/features/inventory/hooks/useSuppliers";
import {
  DataTable,
  DialogForm,
  FormField,
  FormRow,
  FormSection,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

export function SupplierManagementPage() {
  const suppliersQuery = useSuppliersQuery();
  const createMutation = useCreateSupplierMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const canSubmit = form.name.trim().length > 0 && !createMutation.isPending;

  async function onSubmit() {
    if (!canSubmit) return;
    await createMutation.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim() ? form.email.trim() : undefined,
      phone: form.phone.trim() ? form.phone.trim() : undefined,
      address: form.address.trim() ? form.address.trim() : undefined,
    });
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  }

  const suppliers = suppliersQuery.data || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() || "—"}</span>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Supplier Management"
        subtitle="Suppliers are scoped to your cafe and optionally branch."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/purchases">Purchases</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/dashboard">Inventory</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add supplier
            </Button>
          </>
        }
      />

      <KpiGrid cols={2}>
        <KpiCard
          label="Total suppliers"
          value={suppliers.length}
          icon={Truck}
          accent="blue"
          loading={suppliersQuery.isLoading}
        />
        <KpiCard
          label="With contact email"
          value={suppliers.filter((s) => s.email).length}
          hint="Reachable vendors"
          accent="cyan"
          loading={suppliersQuery.isLoading}
        />
      </KpiGrid>

      <DataTable
        columns={columns}
        data={suppliers}
        loading={suppliersQuery.isLoading}
        searchPlaceholder="Search suppliers…"
        emptyTitle="No suppliers yet"
        emptyDescription="Add your first supplier to start purchasing."
      />

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add supplier"
        description="Register a new vendor for purchase orders."
        onSubmit={onSubmit}
        submitLabel="Create supplier"
        loading={createMutation.isPending}
        size="lg"
      >
        <FormSection title="Supplier details" layout="stack">
          <FormField label="Company name" htmlFor="supplier-name">
            <Input
              id="supplier-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Fresh Farms Ltd"
              required
            />
          </FormField>
          <FormRow>
            <FormField label="Email" htmlFor="supplier-email">
              <Input
                id="supplier-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="vendor@example.com"
              />
            </FormField>
            <FormField label="Phone" htmlFor="supplier-phone">
              <Input
                id="supplier-phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+1 555 000 0000"
              />
            </FormField>
          </FormRow>
          <FormField label="Address" htmlFor="supplier-address">
            <Input
              id="supplier-address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Street, city, country"
            />
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
