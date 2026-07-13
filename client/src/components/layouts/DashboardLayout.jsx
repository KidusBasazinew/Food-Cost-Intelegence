import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
          "mx-auto grid min-h-dvh max-w-[1920px] grid-cols-1",
          collapsed ? "md:grid-cols-[76px_1fr]" : "md:grid-cols-[272px_1fr]",
        )}
      >
        <aside className="hidden border-r border-sidebar-border md:block">
          <Sidebar />
        </aside>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeMobile}
                aria-label="Close navigation"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="absolute inset-y-0 left-0 w-[272px] border-r border-sidebar-border bg-sidebar shadow-erp-elevated"
              >
                <Sidebar />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-dvh flex-col">
          <header className="sticky top-0 z-20 border-b erp-glass">
            <Topbar />
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
