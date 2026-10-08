import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function RequireAuth() {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex max-w-lg flex-col gap-2 p-6">
          <div className="text-sm font-medium">Loading session…</div>
          <div className="text-xs text-muted-foreground">
            Validating authentication.
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
