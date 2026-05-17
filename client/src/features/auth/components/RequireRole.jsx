import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function RequireRole({ roles = [] }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
