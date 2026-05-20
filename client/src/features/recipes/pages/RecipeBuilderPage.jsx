import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
  AnalyticsCard,
  FormField,
  InsightPanel,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";

import { useInventoryItemsQuery } from "@/features/inventory/hooks/useInventoryItems";
import { useMeasurementUnitsQuery } from "@/features/inventory/hooks/useMeasurementUnits";
import {
  useAddRecipeIngredientMutation,
  useDeleteRecipeIngredientMutation,
  useUpdateRecipeIngredientMutation,
} from "@/features/recipes/hooks/useRecipeIngredients";
import {
  useRecalculateRecipeCostMutation,
  useRecipeQuery,
} from "@/features/recipes/hooks/useRecipes";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  const v = toNumber(cents) / 100;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function RecipeBuilderPage() {
  const { id } = useParams();

  const recipeQuery = useRecipeQuery(id);
  const itemsQuery = useInventoryItemsQuery();
  const unitsQuery = useMeasurementUnitsQuery();

  const addMutation = useAddRecipeIngredientMutation(id);
  const updateMutation = useUpdateRecipeIngredientMutation(id);
  const deleteMutation = useDeleteRecipeIngredientMutation(id);
  const recalcMutation = useRecalculateRecipeCostMutation();

  const recipe = recipeQuery.data;
  const items = itemsQuery.data || [];
  const units = unitsQuery.data || [];

  const itemById = useMemo(() => {
    const m = new Map();
    for (const i of items) m.set(i.id, i);
    return m;
  }, [items]);

  const unitById = useMemo(() => {
    const m = new Map();
    for (const u of units) m.set(u.id, u);
    return m;
  }, [units]);

  const [form, setForm] = useState({
    inventoryItemId: "",
    unitId: "",
    quantity: "",
    notes: "",
  });

  const selectedItem = form.inventoryItemId
    ? itemById.get(form.inventoryItemId)
    : null;

  const allowedUnits = useMemo(() => {
    if (!selectedItem?.baseUnit?.baseType) return units;
    return units.filter((u) => u.baseType === selectedItem.baseUnit.baseType);
  }, [units, selectedItem]);

  const est = useMemo(() => {
    if (!selectedItem || !form.unitId || !form.quantity) return null;

    const unit = unitById.get(form.unitId);
    const baseUnit = selectedItem.baseUnit;
    if (!unit || !baseUnit) return null;

    const qty = toNumber(form.quantity);
    if (qty <= 0) return null;

    const qtyBase =
      qty *
      (toNumber(unit.conversionFactor) /
        toNumber(baseUnit.conversionFactor || 1));
    const costPerBase = toNumber(selectedItem.averageCostPerBaseUnitCents);
    const totalCostCents = qtyBase * costPerBase;

    return {
      qtyBase,
      baseSymbol: baseUnit.symbol,
      totalCostCents,
    };
  }, [selectedItem, form.unitId, form.quantity, unitById]);

  const canAdd =
    Boolean(id) &&
    form.inventoryItemId &&
    form.unitId &&
    toNumber(form.quantity) > 0 &&
    !addMutation.isPending;

  async function onAdd(e) {
    e.preventDefault();
    if (!canAdd) return;

    await addMutation.mutateAsync({
      recipeId: id,
      inventoryItemId: form.inventoryItemId,
      unitId: form.unitId,
      quantity: form.quantity,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    });

    setForm({ inventoryItemId: "", unitId: "", quantity: "", notes: "" });
  }

  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ quantity: "", unitId: "", notes: "" });

  function beginEdit(ing) {
    setEditingId(ing.id);
    setEdit({
      quantity: String(ing.quantity ?? ""),
      unitId: ing.unitId,
      notes: ing.notes ?? "",
    });
  }

  async function saveEdit(ing) {
    if (!editingId) return;

    await updateMutation.mutateAsync({
      id: ing.id,
      input: {
        quantity: edit.quantity,
        unitId: edit.unitId,
        notes: edit.notes.trim() ? edit.notes.trim() : null,
      },
    });

    setEditingId(null);
  }

  async function removeIngredient(ing) {
    await deleteMutation.mutateAsync(ing.id);
  }

  return (
    <PageShell>
      <PageHeader
        title={recipe ? `Builder: ${recipe.name}` : "Recipe Builder"}
        subtitle="Add ingredients and recalculate live food cost from inventory."
        actions={
          <>
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => recalcMutation.mutate(id)}
              disabled={!id || recalcMutation.isPending}
            >
              {recalcMutation.isPending ? "Recalculating…" : "Recalculate cost"}
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to={`/recipes/${id}`}>Details</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/recipes">Back</Link>
            </Button>
          </>
        }
      />

      <KpiGrid cols={4}>
        <KpiCard label="Total cost" value={formatMoney(recipe?.totalCostCents)} accent="amber" loading={recipeQuery.isLoading} />
        <KpiCard label="Selling" value={formatMoney(recipe?.sellingPriceCents)} accent="blue" loading={recipeQuery.isLoading} />
        <KpiCard label="Profit" value={formatMoney(recipe?.estimatedProfitCents)} accent="emerald" loading={recipeQuery.isLoading} />
        <KpiCard
          label="Margin"
          value={`${toNumber(recipe?.estimatedProfitMargin).toFixed(1)}%`}
          accent="purple"
          loading={recipeQuery.isLoading}
        />
      </KpiGrid>

      <InsightPanel variant="analytics" title="Live costing">
        Costs update automatically from weighted average inventory prices when you add or edit ingredients.
      </InsightPanel>

      <AnalyticsCard title="Add ingredient" accent="purple">
        <form onSubmit={onAdd} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Inventory item" className="sm:col-span-2">
            <Select
              value={form.inventoryItemId}
              onValueChange={(v) => {
                const nextItem = v ? itemById.get(v) : null;
                setForm((f) => ({
                  ...f,
                  inventoryItemId: v,
                  unitId: nextItem?.baseUnitId ?? "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item…" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} (base: {i.baseUnit?.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Unit">
            <Select
              value={form.unitId}
              onValueChange={(v) => setForm((f) => ({ ...f, unitId: v }))}
              disabled={!selectedItem}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit…" />
              </SelectTrigger>
              <SelectContent>
                {allowedUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Quantity">
            <Input
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="e.g. 200"
            />
          </FormField>
          <FormField label="Notes (optional)" className="sm:col-span-2 lg:col-span-4">
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. chopped"
            />
          </FormField>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <Button type="submit" className="rounded-xl" disabled={!canAdd}>
              {addMutation.isPending ? "Adding…" : "Add ingredient"}
            </Button>
            {est ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Est: {est.qtyBase.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
                {est.baseSymbol} → {formatMoney(est.totalCostCents)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Select item, unit, and quantity to preview cost.
              </span>
            )}
          </div>
        </form>
      </AnalyticsCard>

      <AnalyticsCard title="Ingredients" accent="indigo">
        <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty (unit)</th>
                  <th className="py-2">Qty (base)</th>
                  <th className="py-2">Cost / Base</th>
                  <th className="py-2">Total</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {recipeQuery.isLoading ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : (recipe?.ingredients || []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-muted-foreground" colSpan={6}>
                      No ingredients yet.
                    </td>
                  </tr>
                ) : (
                  recipe.ingredients.map((ing) => {
                    const isEditing = editingId === ing.id;
                    const item = itemById.get(ing.inventoryItemId);
                    const baseType = item?.baseUnit?.baseType;
                    const editUnits = baseType
                      ? units.filter((u) => u.baseType === baseType)
                      : units;

                    return (
                      <tr key={ing.id} className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0">
                        <td className="py-2">
                          <div className="font-medium">
                            {ing.inventoryItem?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Base: {ing.inventoryItem?.baseUnit?.symbol}
                          </div>
                        </td>

                        <td className="py-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                className="h-8"
                                value={edit.quantity}
                                onChange={(e) =>
                                  setEdit((s) => ({
                                    ...s,
                                    quantity: e.target.value,
                                  }))
                                }
                              />
                              <select
                                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                                value={edit.unitId}
                                onChange={(e) =>
                                  setEdit((s) => ({
                                    ...s,
                                    unitId: e.target.value,
                                  }))
                                }
                              >
                                {editUnits.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.symbol}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <>
                              {toNumber(ing.quantity)} {ing.unit?.symbol}
                              {ing.notes ? (
                                <div className="text-xs text-muted-foreground">
                                  {ing.notes}
                                </div>
                              ) : null}
                            </>
                          )}
                        </td>

                        <td className="py-2">
                          {toNumber(ing.quantityInBaseUnit)}{" "}
                          {ing.inventoryItem?.baseUnit?.symbol}
                        </td>
                        <td className="py-2">
                          {formatMoney(ing.costPerBaseUnitCents)}
                        </td>
                        <td className="py-2">
                          {formatMoney(ing.totalCostCents)}
                        </td>
                        <td className="py-2">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(ing)}
                                disabled={updateMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => beginEdit(ing)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeIngredient(ing)}
                                disabled={deleteMutation.isPending}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
      </AnalyticsCard>
    </PageShell>
  );
}
