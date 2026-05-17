import { ChevronDown, LogOut, Menu, Moon, PanelLeft, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { authApi } from "@/features/auth/api/authApi";

export function Topbar() {
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const openMobile = useSidebarStore((s) => s.openMobile);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isDark = theme === "dark";

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

  return (
    <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-lg border bg-card p-2",
            "hover:bg-accent hover:text-accent-foreground md:hidden",
          )}
          onClick={openMobile}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={cn(
            "hidden items-center justify-center rounded-lg border bg-card p-2 md:inline-flex",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="text-sm font-medium">Dashboard</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm",
            "hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-45 truncate text-sm md:inline">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
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
