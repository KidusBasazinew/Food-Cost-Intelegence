import { useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreateSupplierMutation,
  useSuppliersQuery,
} from "@/features/inventory/hooks/useSuppliers";

export function SupplierManagementPage() {
  const suppliersQuery = useSuppliersQuery();
  const createMutation = useCreateSupplierMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const canSubmit = form.name.trim().length > 0 && !createMutation.isPending;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    await createMutation.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim() ? form.email.trim() : undefined,
      phone: form.phone.trim() ? form.phone.trim() : undefined,
      address: form.address.trim() ? form.address.trim() : undefined,
    });

    setForm({ name: "", email: "", phone: "", address: "" });
  }

  const suppliers = suppliersQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Supplier Management</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Suppliers are scoped to your hotel (and optionally branch).
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/purchases">Back to purchases</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/dashboard">Inventory</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Add Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Fresh Farms Ltd"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="optional"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="optional"
              />
            </div>
            <div className="md:col-span-4">
              <div className="text-xs text-muted-foreground">Address</div>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="optional"
              />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={!canSubmit}>
                {createMutation.isPending ? "Saving…" : "Create supplier"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {suppliersQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={3}>
                      Loading…
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={3}>
                      No suppliers yet.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="py-2 font-medium">{s.name}</td>
                      <td className="py-2 text-muted-foreground">
                        {s.email || "—"}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {s.phone || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
