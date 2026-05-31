import { Link } from "react-router-dom";
import {
  ArrowRight,
  DollarSign,
  Package,
  Percent,
  ShoppingCart,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AnalyticsCard,
  ContentGrid,
  InsightPanel,
  KpiCard,
  KpiGrid,
  PageHeader,
  PageShell,
} from "@/components/ui/erp";
import { DashboardNotificationsWidget } from "@/features/notifications/components/DashboardNotificationsWidget";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const quickLinks = [
  {
    to: "/inventory/dashboard",
    label: "Inventory",
    desc: "Stock levels, alerts & transactions",
    icon: Package,
    accent: "blue",
  },
  {
    to: "/recipes",
    label: "Recipes",
    desc: "Menu costing & recipe builder",
    icon: UtensilsCrossed,
    accent: "purple",
  },
  {
    to: "/purchases",
    label: "Purchasing",
    desc: "Orders, suppliers & receiving",
    icon: ShoppingCart,
    accent: "amber",
  },
  {
    to: "/analytics",
    label: "Analytics",
    desc: "Executive food ops intelligence",
    icon: TrendingUp,
    accent: "emerald",
  },
];

export function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const hotel = user?.hotel;
  const hotelLocation = [hotel?.city, hotel?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <PageShell>
      <PageHeader
        title={
          hotel?.name ? `Welcome to ${hotel.name}` : "Welcome to Food Ops ERP"
        }
        subtitle={
          hotel?.name
            ? `Hotel workspace — ${hotelLocation || "Location not set"}`
            : "Executive operational intelligence for hospitality food operations — inventory, costing, waste, and profitability in one premium workspace."
        }
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Operations center
          </span>
        }
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/analytics">
              View analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      >
        {hotel?.name ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card">
              {hotel.logoUrl ? (
                <img
                  src={hotel.logoUrl}
                  alt={`${hotel.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  {hotel.name
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{hotel.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {hotelLocation || "Hotel details"}
              </div>
            </div>
          </div>
        ) : null}
      </PageHeader>

      <KpiGrid cols={4}>
        <KpiCard
          label="Food revenue"
          value="—"
          hint="Connect sales data"
          icon={DollarSign}
          accent="purple"
          trend={12}
          trendLabel="↑ vs last month"
        />
        <KpiCard
          label="Food cost %"
          value="—"
          hint="Target: 28–32%"
          icon={Percent}
          accent="amber"
        />
        <KpiCard
          label="Inventory value"
          value="—"
          hint="Real-time valuation"
          icon={Package}
          accent="blue"
        />
        <KpiCard
          label="Waste loss"
          value="—"
          hint="Track reduction goals"
          icon={Trash2}
          accent="rose"
          trend={-8}
          trendLabel="↓ 8% vs last week"
        />
      </KpiGrid>

      <ContentGrid cols={3}>
        <AnalyticsCard
          title="Quick navigation"
          description="Jump into core operational modules"
          accent="purple"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-3 rounded-xl border bg-muted/20 p-4 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm ${
                    item.accent === "blue"
                      ? "from-blue-500 to-blue-600"
                      : item.accent === "purple"
                        ? "from-violet-500 to-purple-600"
                        : item.accent === "amber"
                          ? "from-amber-500 to-orange-500"
                          : "from-emerald-500 to-emerald-600"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold group-hover:text-primary">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </AnalyticsCard>

        <DashboardNotificationsWidget />

        <InsightPanel variant="analytics" title="Operational intelligence">
          Your platform is fully connected — inventory flows, recipe costing,
          purchase management, waste analytics, and executive dashboards are
          live. Use Analytics for revenue vs. cost trends, menu engineering, and
          supplier intelligence.
        </InsightPanel>
      </ContentGrid>
    </PageShell>
  );
}
