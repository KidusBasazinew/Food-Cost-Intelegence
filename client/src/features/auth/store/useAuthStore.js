import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      bootstrapped: false,
      accessToken: null,
      user: null, // Includes { id, email, role, firstName, lastName, hotel, branch, permissions: [] }

      isAuthenticated: () => Boolean(get().accessToken && get().user),

      setAuth: ({ accessToken, user }) =>
        set({ accessToken, user: user || null }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null }),
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),

      /**
       * Check if user has a specific permission
       */
      hasPermission: (permission) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },

      /**
       * Check if user has any of the provided permissions
       */
      hasAnyPermission: (permissions = []) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        return permissions.some((p) => user.permissions.includes(p));
      },

      /**
       * Check if user has all of the provided permissions
       */
      hasAllPermissions: (permissions = []) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        return permissions.every((p) => user.permissions.includes(p));
      },

      /**
       * Get user's role
       */
      getRole: () => {
        return get().user?.role;
      },
    }),
    {
      name: "fcip.auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
