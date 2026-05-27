import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChefHat, Plus } from "lucide-react";

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
  useCreateRecipeMutation,
  useRecipesQuery,
} from "@/features/recipes/hooks/useRecipes";
import {
  formatRecipeYield,
  RECIPE_YIELD_UNITS,
} from "@/features/recipes/lib/recipeYieldUnit";
import {
  DataTable,
  DialogForm,
  FormField,
  FormSection,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
  StatusBadge,
} from "@/components/ui/erp";

function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(cents) {
  return (toNumber(cents) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "ETB",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  });
}

const EMPTY_FORM = {
  name: "",
  yieldQuantity: "1",
  yieldUnit: "PORTION",
  sellingPriceCents: "0",
  imageUrl: null,
  status: "ACTIVE",
};

export function RecipeManagementPage() {
  const recipesQuery = useRecipesQuery();
  const createMutation = useCreateRecipeMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const recipes = recipesQuery.data || [];

  const canSubmit =
    form.name.trim().length > 0 && form.yieldUnit && !createMutation.isPending;

  async function onSubmit() {
    if (!canSubmit) return;
    await createMutation.mutateAsync({
      name: form.name.trim(),
      imageUrl: form.imageUrl?.trim() || null,
      yieldQuantity: form.yieldQuantity,
      yieldUnit: form.yieldUnit,
      sellingPriceCents: form.sellingPriceCents,
      status: form.status,
    });
    setForm((f) => ({ ...EMPTY_FORM, yieldUnit: f.yieldUnit }));
    setDialogOpen(false);
  }

  const activeCount = recipes.filter((r) => r.status === "ACTIVE").length;
  const avgMargin =
    recipes.length > 0
      ? recipes.reduce((a, r) => a + toNumber(r.estimatedProfitMargin), 0) /
        recipes.length
      : 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Recipe",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.imageUrl || "https://placehold.co/80x80"}
              alt={row.original.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <Link
                className="font-medium text-primary hover:underline"
                to={`/recipes/${row.original.id}`}
              >
                {row.original.name}
              </Link>
              <div className="text-xs text-muted-foreground">
                Updated {new Date(row.original.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "yield",
        header: "Yield",
        cell: ({ row }) =>
          formatRecipeYield({
            yieldQuantity: row.original.yieldQuantity,
            yieldUnit: row.original.yieldUnit,
          }),
      },
      {
        id: "ingredients",
        header: "Ingredients",
        cell: ({ row }) => row.original._count?.ingredients ?? 0,
      },
      {
        id: "cost",
        header: "Total cost",
        cell: ({ row }) => formatMoney(row.original.totalCostCents),
      },
      {
        id: "selling",
        header: "Selling",
        cell: ({ row }) => formatMoney(row.original.sellingPriceCents),
      },
      {
        id: "margin",
        header: "Margin",
        cell: ({ row }) => {
          const m = toNumber(row.original.estimatedProfitMargin);
          return (
            <span
              className={
                m < 10
                  ? "font-medium text-amber-600 dark:text-amber-400"
                  : "font-medium text-emerald-600 dark:text-emerald-400"
              }
            >
              {m.toLocaleString(undefined, { maximumFractionDigits: 2 })}%
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge
            status={getValue() === "ACTIVE" ? "active" : "inactive"}
            label={getValue()}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="secondary" className="rounded-lg">
            <Link to={`/recipes/${row.original.id}/builder`}>Builder</Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Recipe Management"
        subtitle="Build recipes from inventory items. Costs update dynamically from weighted average costing."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/food-cost">Food cost</Link>
            </Button>
            <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create recipe
            </Button>
          </>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Total recipes"
          value={recipes.length}
          icon={ChefHat}
          accent="purple"
          loading={recipesQuery.isLoading}
        />
        <KpiCard
          label="Active"
          value={activeCount}
          accent="emerald"
          loading={recipesQuery.isLoading}
        />
        <KpiCard
          label="Avg margin"
          value={`${avgMargin.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
          accent="indigo"
          loading={recipesQuery.isLoading}
        />
      </KpiGrid>

      <DataTable
        columns={columns}
        data={recipes}
        loading={recipesQuery.isLoading}
        searchPlaceholder="Search recipes…"
        emptyTitle="No recipes yet"
        emptyDescription="Create a recipe and open the builder to add ingredients."
      />

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create recipe"
        description="Define yield and selling price. Add ingredients in the builder."
        onSubmit={onSubmit}
        submitLabel="Create recipe"
        loading={createMutation.isPending}
        size="lg"
      >
        <FormSection title="Recipe details">
          <FormField label="Name" fullWidth>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chicken Stew"
            />
          </FormField>
          <FormField label="Image URL" fullWidth>
            <div className="space-y-3">
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder="https://images.unsplash.com/..."
              />

              {form.imageUrl && (
                <div className="overflow-hidden rounded-xl border">
                  <img
                    src={form.imageUrl}
                    alt="Recipe preview"
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </FormField>
          <FormField label="Yield quantity">
            <Input
              value={form.yieldQuantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, yieldQuantity: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Yield unit">
            <Select
              value={form.yieldUnit}
              onValueChange={(v) => setForm((f) => ({ ...f, yieldUnit: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit…" />
              </SelectTrigger>
              <SelectContent>
                {RECIPE_YIELD_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Selling price (cents)">
            <Input
              value={form.sellingPriceCents}
              onChange={(e) =>
                setForm((f) => ({ ...f, sellingPriceCents: e.target.value }))
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
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
