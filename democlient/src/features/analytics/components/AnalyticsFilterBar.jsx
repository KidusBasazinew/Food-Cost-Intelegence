import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { daysAgoISODate, todayISODate } from "@/features/analytics/utils/dates";

export function AnalyticsFilterBar({
  filters,
  setFilters,
  onApply,
  isLoading,
  suppliers = [],
  inventoryItems = [],
}) {
  const defaults = useMemo(
    () => ({
      fromDate: daysAgoISODate(30),
      toDate: todayISODate(),
      supplierId: "",
      inventoryItemId: "",
      menuCategory: "",
    }),
    [],
  );

  const f = { ...defaults, ...filters };

  return (
    <div className="rounded-2xl border bg-card/80 p-5 shadow-erp backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Filters</p>
        <span className="text-xs text-muted-foreground">Date range & scope</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-8">
        <div className="md:col-span-2">
          <div className="text-xs font-medium text-muted-foreground">From</div>
          <Input
            type="date"
            value={f.fromDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, fromDate: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium text-muted-foreground">To</div>
          <Input
            type="date"
            value={f.toDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, toDate: e.target.value }))
            }
          />
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Branch
          </div>
          <Input
            placeholder="(optional) branchId"
            value={filters.branchId || ""}
            onChange={(e) =>
              setFilters((s) => ({ ...s, branchId: e.target.value }))
            }
          />
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Menu category
          </div>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors focus:ring-2 focus:ring-ring/30"
            value={f.menuCategory}
            onChange={(e) =>
              setFilters((s) => ({ ...s, menuCategory: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value="STAR">Star</option>
            <option value="PUZZLE">Puzzle</option>
            <option value="PLOWHORSE">Plowhorse</option>
            <option value="DOG">Dog</option>
          </select>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Supplier
          </div>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors focus:ring-2 focus:ring-ring/30"
            value={filters.supplierId || ""}
            onChange={(e) =>
              setFilters((s) => ({ ...s, supplierId: e.target.value }))
            }
          >
            <option value="">All</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Ingredient
          </div>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors focus:ring-2 focus:ring-ring/30"
            value={filters.inventoryItemId || ""}
            onChange={(e) =>
              setFilters((s) => ({ ...s, inventoryItemId: e.target.value }))
            }
          >
            <option value="">All</option>
            {inventoryItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground">Top N</div>
          <Input
            type="number"
            min={5}
            max={50}
            value={String(filters.topN ?? 10)}
            onChange={(e) =>
              setFilters((s) => ({ ...s, topN: Number(e.target.value || 10) }))
            }
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" className="rounded-xl" onClick={onApply} disabled={isLoading}>
          {isLoading ? "Loading…" : "Apply filters"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => setFilters(defaults)}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
