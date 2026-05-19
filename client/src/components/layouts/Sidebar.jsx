import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  LineChart,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/recipes", label: "Recipes", icon: ClipboardList },
  { to: "/food-cost", label: "Food Cost", icon: UtensilsCrossed },
  { to: "/consumption", label: "Consumption", icon: LineChart },
  { to: "/waste", label: "Waste", icon: Trash2 },
  { to: "/profitability", label: "Profitability", icon: TrendingUp },
  { to: "/purchases", label: "Purchases", icon: ShoppingCart },
  { to: "/reports", label: "Reports", icon: Receipt },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <div className="flex h-dvh flex-col">
      <div className={cn("border-b", collapsed ? "p-4" : "p-5")}>
        <div className="text-sm font-medium tracking-wide">
          {collapsed ? "ERP" : "Food Ops ERP"}
        </div>
        {collapsed ? null : (
          <div className="text-xs text-muted-foreground">
            Executive Kitchen Intelligence
          </div>
        )}
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className={cn(collapsed ? "hidden" : "inline")}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          "border-t text-xs text-muted-foreground",
          collapsed ? "p-3" : "p-4",
        )}
      >
        {collapsed ? "BI" : "Food operations BI"}
      </div>
    </div>
  );
}
