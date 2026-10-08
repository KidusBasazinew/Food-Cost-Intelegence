import { useEffect } from "react";

import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function AuthBootstrap() {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (bootstrapped) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await authApi.refresh();
        if (!cancelled) setAuth(data);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, setBootstrapped, setAuth, clearAuth]);

  return null;
}
