export function DashboardHomePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="text-sm text-muted-foreground">Hospitality ERP</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Foundation Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This is the UI shell only. Inventory intelligence, recipe costing,
          analytics, forecasting, and ERP modules will be implemented later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {["Inventory", "Recipes", "Purchasing"].map((label) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <div className="text-sm font-medium">{label}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Module placeholder
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
