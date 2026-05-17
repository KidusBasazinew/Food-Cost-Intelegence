import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layouts/Sidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const closeMobile = useSidebarStore((s) => s.closeMobile);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className={cn(
          "mx-auto grid max-w-400 grid-cols-1",
          collapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[260px_1fr]",
        )}
      >
        <aside className="hidden border-r bg-card md:block">
          <Sidebar />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={closeMobile}
              aria-label="Close navigation"
            />
            <div className="absolute inset-y-0 left-0 w-70 border-r bg-card shadow-sm">
              <Sidebar />
            </div>
          </div>
        ) : null}

        <div className="min-h-dvh">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <Topbar />
          </header>

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
