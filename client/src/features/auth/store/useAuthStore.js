import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      bootstrapped: false,
      accessToken: null,
      user: null,

      isAuthenticated: () => Boolean(get().accessToken && get().user),

      setAuth: ({ accessToken, user }) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null }),
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),
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
