import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { resolveTheme } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api/authApi";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/inventory": "Inventory",
  "/recipes": "Recipes",
  "/food-cost": "Food Cost",
  "/consumption": "Consumption",
  "/waste": "Waste Analytics",
  "/profitability": "Profitability",
  "/purchases": "Purchases",
  "/suppliers": "Suppliers",
  "/reports": "Reports",
  "/employees": "Employees",
  "/settings": "Settings",
};

function getPageTitle(pathname) {
  const match = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path),
  );
  return match?.[1] || "Food Ops ERP";
}

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const openMobile = useSidebarStore((s) => s.openMobile);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const resolvedTheme = resolveTheme(theme);
  const isDark = resolvedTheme === "dark";
  const pageTitle = getPageTitle(location.pathname);

  async function onLogout() {
    try {
      await authApi.logout();
    } catch {
      // no-op
    } finally {
      clearAuth();
      toast.success("Logged out");
      navigate("/login", { replace: true });
    }
  }

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "U";

  const roleLabel = user?.role?.replace(/_/g, " ") || "Operations";

  return (
    <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-xl border bg-card p-2.5 shadow-sm",
            "hover:bg-accent md:hidden",
          )}
          onClick={openMobile}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={cn(
            "hidden items-center justify-center rounded-xl border bg-card p-2.5 shadow-sm md:inline-flex",
            "hover:bg-accent",
          )}
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight">
            {pageTitle}
          </h2>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Hospitality food operations intelligence
          </p>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 px-4 lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory, recipes, suppliers…"
            className="rounded-xl border-muted bg-muted/30 pl-9 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 lg:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          Live
        </span>

        <NotificationBell />

        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-xl bg-card p-2.5 ",
            "hover:bg-accent",
          )}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl bg-card py-1.5 pl-1.5 pr-3",
                "hover:bg-accent",
              )}
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left md:block">
                <span className="block max-w-28 truncate text-sm font-semibold">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </span>
                <span className="block text-[11px] capitalize text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 opacity-60 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <div className="text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
