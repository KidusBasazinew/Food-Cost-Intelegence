import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateMeasurementUnitMutation,
  useDeleteMeasurementUnitMutation,
  useMeasurementUnitsQuery,
  useUpdateMeasurementUnitMutation,
} from "@/features/inventory/hooks/useMeasurementUnits";
import {
  AnalyticsCard,
  DialogForm,
  FormField,
  FormSection,
  KpiCard,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";

const baseTypes = ["G", "ML", "PIECE"];

function normalizeNumberString(v) {
  return String(v ?? "").trim();
}

const EMPTY_CREATE = {
  name: "",
  symbol: "",
  baseType: "G",
  conversionFactor: "1",
  isBaseUnit: false,
};

export function MeasurementUnitsAdminPage() {
  const unitsQuery = useMeasurementUnitsQuery();
  const createMutation = useCreateMeasurementUnitMutation();
  const updateMutation = useUpdateMeasurementUnitMutation();
  const deleteMutation = useDeleteMeasurementUnitMutation();

  const units = unitsQuery.data || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [drafts, setDrafts] = useState({});

  const canCreate =
    createForm.name.trim() &&
    createForm.symbol.trim() &&
    createForm.baseType &&
    normalizeNumberString(createForm.conversionFactor) &&
    !createMutation.isPending;

  async function onCreate() {
    if (!canCreate) return;
    await createMutation.mutateAsync({
      name: createForm.name.trim(),
      symbol: createForm.symbol.trim(),
      baseType: createForm.baseType,
      conversionFactor: createForm.isBaseUnit ? "1" : createForm.conversionFactor,
      isBaseUnit: createForm.isBaseUnit,
    });
    setCreateForm({ ...EMPTY_CREATE, baseType: createForm.baseType });
    setDialogOpen(false);
  }

  function initDraftIfMissing(unit) {
    setDrafts((d) => {
      if (d[unit.id]) return d;
      return {
        ...d,
        [unit.id]: {
          name: unit.name ?? "",
          symbol: unit.symbol ?? "",
          baseType: unit.baseType ?? "G",
          conversionFactor: String(unit.conversionFactor ?? "1"),
          isBaseUnit: Boolean(unit.isBaseUnit),
        },
      };
    });
  }

  async function onSave(id) {
    const draft = drafts[id];
    if (!draft) return;
    await updateMutation.mutateAsync({
      id,
      input: {
        name: draft.name.trim() || undefined,
        symbol: draft.symbol.trim() || undefined,
        conversionFactor: draft.isBaseUnit ? "1" : draft.conversionFactor,
        isBaseUnit: draft.isBaseUnit,
      },
    });
  }

  async function onDelete(id) {
    await deleteMutation.mutateAsync(id);
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  }

  const baseUnitCount = useMemo(
    () => units.filter((u) => u.isBaseUnit).length,
    [units],
  );

  return (
    <PageShell>
      <PageHeader
        title="Measurement Units"
        subtitle="Base units must have conversionFactor=1 (g/ml/piece)."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/inventory/items">Items</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link to="/inventory/dashboard">Inventory</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create unit
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Total units"
          value={units.length}
          icon={Ruler}
          accent="blue"
          loading={unitsQuery.isLoading}
        />
        <KpiCard
          label="Base units"
          value={baseUnitCount}
          hint="g, ml, or piece anchors"
          accent="purple"
          loading={unitsQuery.isLoading}
        />
      </div>

      <AnalyticsCard title="Units catalog" accent="indigo">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Base type</th>
                <th className="px-4 py-3">Factor</th>
                <th className="px-4 py-3">Base?</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unitsQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    No units yet.
                  </td>
                </tr>
              ) : (
                units.map((u, idx) => {
                  const draft = drafts[u.id];
                  const row = draft || {
                    name: u.name,
                    symbol: u.symbol,
                    baseType: u.baseType,
                    conversionFactor: String(u.conversionFactor ?? "1"),
                    isBaseUnit: Boolean(u.isBaseUnit),
                  };

                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0 ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                      onMouseEnter={() => initDraftIfMissing(u)}
                    >
                      <td className="px-4 py-3">
                        <Input
                          value={row.name}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [u.id]: { ...row, name: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={row.symbol}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [u.id]: { ...row, symbol: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status="operational" label={row.baseType} />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={row.isBaseUnit ? "1" : row.conversionFactor}
                          disabled={row.isBaseUnit}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [u.id]: {
                                ...row,
                                conversionFactor: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={row.isBaseUnit}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [u.id]: {
                                ...row,
                                isBaseUnit: e.target.checked,
                                conversionFactor: e.target.checked
                                  ? "1"
                                  : row.conversionFactor,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => onSave(u.id)}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => onDelete(u.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AnalyticsCard>

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create measurement unit"
        onSubmit={onCreate}
        submitLabel="Create unit"
        loading={createMutation.isPending}
        size="lg"
      >
        <FormSection title="Unit definition">
          <FormField label="Name">
            <Input
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="e.g. Gram"
            />
          </FormField>
          <FormField label="Symbol">
            <Input
              value={createForm.symbol}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, symbol: e.target.value }))
              }
              placeholder="e.g. g"
            />
          </FormField>
          <FormField label="Base type">
            <Select
              value={createForm.baseType}
              onValueChange={(v) => setCreateForm((f) => ({ ...f, baseType: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Conversion factor">
            <Input
              value={createForm.isBaseUnit ? "1" : createForm.conversionFactor}
              disabled={createForm.isBaseUnit}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  conversionFactor: e.target.value,
                }))
              }
              placeholder="e.g. 1000"
            />
          </FormField>
          <FormField label="Base unit" fullWidth>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={createForm.isBaseUnit}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    isBaseUnit: e.target.checked,
                    conversionFactor: e.target.checked ? "1" : f.conversionFactor,
                  }))
                }
              />
              This is a base unit (conversion factor = 1)
            </label>
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
