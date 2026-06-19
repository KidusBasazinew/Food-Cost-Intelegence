import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Infinity,
  LineChart,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Trash2,
  Truck,
  Users,
  UtensilsCrossed,
  Zap,
  House,
  Clock,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
      { to: "/analytics", label: "Analytics", icon: LineChart },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/inventory", label: "Inventory", icon: Package },
      { to: "/recipes", label: "Recipes", icon: ClipboardList },
      { to: "/purchases", label: "Purchases", icon: ShoppingCart },
      { to: "/suppliers", label: "Suppliers", icon: Truck },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/food-cost", label: "Food Cost", icon: UtensilsCrossed },
      { to: "/consumption", label: "Consumption", icon: Zap },
      { to: "/waste", label: "Waste", icon: Trash2 },
      { to: "/profitability", label: "Profitability", icon: TrendingUp },
    ],
  },
  {
    label: "POS",
    items: [
      { to: "/pos", label: "POS", icon: ShoppingCart },
      { to: "/pos/orders", label: "Orders", icon: ClipboardList },
      { to: "/pos/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/kitchen", label: "Kitchen Display", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Organization",
    items: [{ to: "/reports", label: "Reports", icon: Receipt }],
  },
  {
    label: "House Keeping",
    items: [
      { to: "/ops/rooms", label: "Rooms", icon: House },
      { to: "/ops/reservations", label: "Reservations", icon: Calendar },
      { to: "/ops/late-checkout", label: "Late Checkout", icon: Clock },
      { to: "/ops/housekeeping", label: "Housekeeping", icon: Infinity },
      { to: "/ops/cleaner", label: "Cleaner", icon: Clock },
    ],
  },
];

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const closeMobile = useSidebarStore((s) => s.closeMobile);
  const user = useAuthStore((s) => s.user);
  const hotel = user?.hotel;
  const hotelLocation = [hotel?.city, hotel?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex h-dvh flex-col bg-sidebar">
      <div
        className={cn(
          "border-b border-sidebar-border",
          collapsed ? "p-4" : "p-5",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center ">
            <img
              src={hotel?.logoUrl || "./logo-01.png"}
              alt={hotel?.name ? `${hotel.name} logo` : "Logo"}
              className="h-16 w-16 object-contain"
            />
          </div>
          {!collapsed ? (
            <div>
              <div className="text-sm font-bold tracking-tight">
                {hotel?.name || "Food Ops ERP"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {hotelLocation || "Kitchen Intelligence"}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!collapsed ? (
        <div className="mx-4 mt-4 rounded-xl border border-violet-200/50 bg-linear-to-br from-violet-50 to-indigo-50 p-3 dark:border-violet-800/30 dark:from-violet-950/40 dark:to-indigo-950/30">
          <div className="flex items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live operations
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Real-time food cost & inventory signals
          </p>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-5")}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            ) : gi > 0 ? (
              <Separator className="my-3" />
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white erp-sidebar-active-glow"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                          isActive && "text-white",
                        )}
                      />
                      <span className={cn(collapsed ? "hidden" : "inline")}>
                        {item.label}
                      </span>
                      {!collapsed && isActive ? (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-80" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-sidebar-border",
          collapsed ? "p-3" : "p-4",
        )}
      >
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <button
              type="button"
              className="w-full rounded-xl border bg-card px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted/50"
            >
              <span className="font-medium">Main Kitchen</span>
              <span className="mt-0.5 block text-muted-foreground">
                Workspace
              </span>
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Food Ops ERP © 2026
            </p>
          </motion.div>
        ) : (
          <p className="text-center text-[10px] text-muted-foreground">ERP</p>
        )}
      </div>
    </div>
  );
}
