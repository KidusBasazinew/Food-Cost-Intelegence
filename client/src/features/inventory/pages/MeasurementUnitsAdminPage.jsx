import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  useCreateMeasurementUnitMutation,
  useDeleteMeasurementUnitMutation,
  useMeasurementUnitsQuery,
  useUpdateMeasurementUnitMutation,
} from "@/features/inventory/hooks/useMeasurementUnits";

const baseTypes = ["G", "ML", "PIECE"];

function normalizeNumberString(v) {
  const s = String(v ?? "").trim();
  return s;
}

export function MeasurementUnitsAdminPage() {
  const unitsQuery = useMeasurementUnitsQuery();

  const createMutation = useCreateMeasurementUnitMutation();
  const updateMutation = useUpdateMeasurementUnitMutation();
  const deleteMutation = useDeleteMeasurementUnitMutation();

  const units = unitsQuery.data || [];

  const [createForm, setCreateForm] = useState({
    name: "",
    symbol: "",
    baseType: "G",
    conversionFactor: "1",
    isBaseUnit: false,
  });

  const canCreate =
    createForm.name.trim() &&
    createForm.symbol.trim() &&
    createForm.baseType &&
    normalizeNumberString(createForm.conversionFactor) &&
    !createMutation.isPending;

  async function onCreate(e) {
    e.preventDefault();
    if (!canCreate) return;

    const input = {
      name: createForm.name.trim(),
      symbol: createForm.symbol.trim(),
      baseType: createForm.baseType,
      conversionFactor: createForm.isBaseUnit
        ? "1"
        : createForm.conversionFactor,
      isBaseUnit: createForm.isBaseUnit,
    };

    await createMutation.mutateAsync(input);

    setCreateForm({
      name: "",
      symbol: "",
      baseType: createForm.baseType,
      conversionFactor: "1",
      isBaseUnit: false,
    });
  }

  const [drafts, setDrafts] = useState({});

  const draftsById = useMemo(() => drafts, [drafts]);

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
    const draft = draftsById[id];
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">Measurement Units</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Base units must have conversionFactor=1 (g/ml/piece).
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/inventory/items">Back to items</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/dashboard">Inventory</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Create Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Gram"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Symbol</div>
              <Input
                value={createForm.symbol}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, symbol: e.target.value }))
                }
                placeholder="e.g. g"
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Base Type</div>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={createForm.baseType}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, baseType: e.target.value }))
                }
              >
                {baseTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Conversion Factor
              </div>
              <Input
                value={
                  createForm.isBaseUnit ? "1" : createForm.conversionFactor
                }
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    conversionFactor: e.target.value,
                  }))
                }
                disabled={createForm.isBaseUnit}
                placeholder="e.g. 1000"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={createForm.isBaseUnit}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      isBaseUnit: e.target.checked,
                      conversionFactor: e.target.checked
                        ? "1"
                        : f.conversionFactor,
                    }))
                  }
                />
                Base unit
              </label>
            </div>
            <div className="md:col-span-6">
              <Button type="submit" disabled={!canCreate}>
                {createMutation.isPending ? "Creating…" : "Create unit"}
              </Button>
              {unitsQuery.isLoading && (
                <span className="ml-3 text-xs text-muted-foreground">
                  Loading…
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Symbol</th>
                  <th className="py-2">Base Type</th>
                  <th className="py-2">Factor</th>
                  <th className="py-2">Base?</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitsQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      No units yet.
                    </td>
                  </tr>
                ) : (
                  units.map((u) => {
                    const draft = draftsById[u.id];
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
                        className="border-b last:border-b-0"
                        onMouseEnter={() => initDraftIfMissing(u)}
                      >
                        <td className="py-2">
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
                        <td className="py-2">
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
                        <td className="py-2">
                          <select
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                            value={row.baseType}
                            disabled
                          >
                            {baseTypes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Base type is immutable.
                          </div>
                        </td>
                        <td className="py-2">
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
                        <td className="py-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
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
                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onSave(u.id)}
                              disabled={updateMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
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
        </CardContent>
      </Card>
    </div>
  );
}
