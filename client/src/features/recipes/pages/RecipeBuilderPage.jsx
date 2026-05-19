import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Recipe Builder</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {recipe ? recipe.name : "Loading…"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => recalcMutation.mutate(id)}
            disabled={!id || recalcMutation.isPending}
          >
            {recalcMutation.isPending ? "Recalculating…" : "Recalculate cost"}
          </Button>
          <Button asChild variant="outline">
            <Link to={`/recipes/${id}`}>Details</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/recipes">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Live Costing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total cost</span>
              <span className="font-medium">
                {formatMoney(recipe?.totalCostCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selling price</span>
              <span className="font-medium">
                {formatMoney(recipe?.sellingPriceCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-medium">
                {formatMoney(recipe?.estimatedProfitCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profit margin</span>
              <span className="font-medium">
                {toNumber(recipe?.estimatedProfitMargin).toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  },
                )}
                %
              </span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              Costs update from weighted average inventory costs.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Add Ingredient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAdd} className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground">
                  Inventory item
                </div>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.inventoryItemId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const nextItem = nextId ? itemById.get(nextId) : null;
                    setForm((f) => ({
                      ...f,
                      inventoryItemId: nextId,
                      unitId: nextItem?.baseUnitId ?? "",
                    }));
                  }}
                >
                  <option value="">Select…</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (base: {i.baseUnit?.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Unit</div>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.unitId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unitId: e.target.value }))
                  }
                  disabled={!selectedItem}
                >
                  <option value="">Select…</option>
                  {allowedUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Quantity</div>
                <Input
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="e.g. 200"
                />
              </div>

              <div className="md:col-span-4">
                <div className="text-xs text-muted-foreground">
                  Notes (optional)
                </div>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="e.g. chopped"
                />
              </div>

              <div className="md:col-span-4 flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!canAdd}>
                  {addMutation.isPending ? "Adding…" : "Add ingredient"}
                </Button>
                {est ? (
                  <div className="text-xs text-muted-foreground">
                    Est:{" "}
                    {est.qtyBase.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}{" "}
                    {est.baseSymbol} → {formatMoney(est.totalCostCents)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Select item/unit and enter quantity to preview.
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
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
                      <tr key={ing.id} className="border-b last:border-b-0">
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
                                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
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
        </CardContent>
      </Card>
    </div>
  );
}
