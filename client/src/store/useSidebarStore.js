import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  collapsed: false,
  mobileOpen: false,

  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  openMobile: () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
}));
