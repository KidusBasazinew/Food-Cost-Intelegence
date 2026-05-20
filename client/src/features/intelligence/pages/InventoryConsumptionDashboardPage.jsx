import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
  useConsumeRecipeMutation,
  useConsumptionReportQuery,
  useConsumptionsQuery,
  useUsageVelocityQuery,
} from "@/features/intelligence/hooks/useConsumption";
import { useRecipesQuery } from "@/features/recipes/hooks/useRecipes";
import {
  AnalyticsCard,
  CHART_COLORS,
  ChartTooltip,
  ChartWrapper,
  ContentGrid,
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
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function InventoryConsumptionDashboardPage() {
  const recipesQuery = useRecipesQuery({ status: "ACTIVE" });
  const consumeMutation = useConsumeRecipeMutation();
  const consumptionsQuery = useConsumptionsQuery({});
  const reportQuery = useConsumptionReportQuery({});
  const velocityQuery = useUsageVelocityQuery({ lookbackDays: "30" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [order, setOrder] = useState({
    recipeId: "",
    servings: "1",
    sourceType: "ORDER",
    sourceId: "",
  });

  const report = reportQuery.data;
  const daily = report?.daily || [];
  const topItems = report?.topItems || [];
  const recipes = recipesQuery.data || [];
  const consumptions = consumptionsQuery.data || [];

  const chartData = useMemo(
    () =>
      daily.map((d) => ({
        day: d.day,
        cost: toNumber(d.totalCostCents) / 100,
      })),
    [daily],
  );

  const canConsume =
    Boolean(order.recipeId) &&
    toNumber(order.servings) > 0 &&
    !consumeMutation.isPending;

  async function submitConsume() {
    if (!canConsume) return;
    try {
      await consumeMutation.mutateAsync({
        recipeId: order.recipeId,
        servings: order.servings,
        sourceType: order.sourceType,
        sourceId: order.sourceId.trim() ? order.sourceId.trim() : undefined,
      });
      toast.success("Consumption recorded");
      setOrder((o) => ({ ...o, servings: "1", sourceId: "" }));
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to record consumption");
    }
  }

  const recentColumns = useMemo(
    () => [
      {
        id: "time",
        header: "Time",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "—",
      },
      {
        id: "recipe",
        header: "Recipe",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.recipe?.name ?? "—"}</span>
        ),
      },
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => row.original.inventoryItem?.name ?? "—",
      },
      {
        id: "qty",
        header: "Qty (base)",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityConsumedBaseUnit).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${row.original.inventoryItem?.baseUnit?.symbol}`,
      },
      {
        id: "cost",
        header: "Cost",
        cell: ({ row }) => formatMoney(row.original.totalCostCents),
      },
      {
        accessorKey: "sourceType",
        header: "Source",
        cell: ({ row }) => (
          <div>
            <StatusBadge status="operational" label={row.original.sourceType} />
            {row.original.sourceId ? (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {row.original.sourceId}
              </div>
            ) : null}
          </div>
        ),
      },
    ],
    [],
  );

  const topColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Item" },
      {
        id: "qty",
        header: "Qty (base)",
        cell: ({ row }) =>
          `${toNumber(row.original.totalQuantityBaseUnit).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${row.original.baseUnitSymbol}`,
      },
      {
        id: "cost",
        header: "Cost",
        cell: ({ row }) => formatMoney(row.original.totalCostCents),
      },
    ],
    [],
  );

  const velocityColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Item" },
      {
        accessorKey: "avgDailyUsageBaseUnit",
        header: "Avg daily",
        cell: ({ row }) =>
          `${toNumber(row.original.avgDailyUsageBaseUnit).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${row.original.baseUnitSymbol}`,
      },
      {
        id: "stock",
        header: "In stock",
        cell: ({ row }) =>
          `${toNumber(row.original.quantityInStock).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${row.original.baseUnitSymbol}`,
      },
      {
        accessorKey: "estimatedDaysRemaining",
        header: "Days left",
        cell: ({ getValue }) => {
          const days = getValue();
          if (days == null) return "—";
          const n = toNumber(days);
          return (
            <StatusBadge
              status={n <= 3 ? "critical" : n <= 7 ? "warning" : "active"}
              label={n.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <PageShell>
      <PageHeader
        title="Inventory Consumption"
        subtitle="Ingredient usage, spend trends, and depletion velocity."
        actions={
          <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Record consumption
          </Button>
        }
      />

      <KpiGrid cols={3}>
        <KpiCard
          label="Total consumption cost"
          value={formatMoney(report?.totalCostCents)}
          accent="cyan"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Deduction rows"
          value={report?.totalRows ?? 0}
          accent="blue"
          loading={reportQuery.isLoading}
        />
        <KpiCard
          label="Top consumed item"
          value={topItems[0]?.name ?? "—"}
          hint={topItems[0] ? formatMoney(topItems[0].totalCostCents) : ""}
          accent="purple"
          loading={reportQuery.isLoading}
        />
      </KpiGrid>

      <ContentGrid>
        <AnalyticsCard title="Daily spend trend" accent="cyan" loading={reportQuery.isLoading}>
          <ChartWrapper empty={chartData.length === 0} height={300}>
            <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v) => [
                      Number(v).toLocaleString(undefined, { style: "currency", currency: "USD" }),
                      "Cost",
                    ]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke={CHART_COLORS.cyan}
                fill="url(#consumptionGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartWrapper>
        </AnalyticsCard>

        <AnalyticsCard title="Top consumed items" accent="indigo">
          <DataTable
            columns={topColumns}
            data={topItems.slice(0, 10)}
            loading={reportQuery.isLoading}
            enableSearch={false}
            pageSize={10}
            emptyTitle="No consumption data"
          />
        </AnalyticsCard>
      </ContentGrid>

      <AnalyticsCard title="Recent consumptions" accent="blue">
        <DataTable
          columns={recentColumns}
          data={consumptions.slice(0, 50)}
          loading={consumptionsQuery.isLoading}
          enableSearch={false}
          pageSize={10}
          emptyTitle="No consumption rows yet"
        />
      </AnalyticsCard>

      <AnalyticsCard title="Usage velocity (30d)" description="Depletion forecast" accent="amber">
        <DataTable
          columns={velocityColumns}
          data={(velocityQuery.data?.items || []).slice(0, 20)}
          loading={velocityQuery.isLoading}
          enableSearch={false}
          pageSize={12}
          emptyTitle="No velocity data yet"
        />
      </AnalyticsCard>

      <DialogForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Record order consumption"
        description="Deducts ingredient stock based on recipe BOM."
        onSubmit={submitConsume}
        submitLabel="Record consumption"
        loading={consumeMutation.isPending}
        size="lg"
      >
        <FormSection title="Order details">
          <FormField label="Recipe" fullWidth>
            <Select
              value={order.recipeId}
              onValueChange={(v) => setOrder((o) => ({ ...o, recipeId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipe…" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Servings">
            <Input
              value={order.servings}
              onChange={(e) => setOrder((o) => ({ ...o, servings: e.target.value }))}
            />
          </FormField>
          <FormField label="Source type">
            <Select
              value={order.sourceType}
              onValueChange={(v) => setOrder((o) => ({ ...o, sourceType: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORDER">ORDER</SelectItem>
                <SelectItem value="TESTING">TESTING</SelectItem>
                <SelectItem value="ADJUSTMENT">ADJUSTMENT</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Order ref (optional)" fullWidth>
            <Input
              value={order.sourceId}
              onChange={(e) => setOrder((o) => ({ ...o, sourceId: e.target.value }))}
              placeholder="e.g. Table 3 - Ticket 0182"
            />
          </FormField>
        </FormSection>
      </DialogForm>
    </PageShell>
  );
}
