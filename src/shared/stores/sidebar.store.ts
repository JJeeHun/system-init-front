import { create } from "zustand"

type SidebarState = {
  mobileOpen: boolean
  desktopExpanded: boolean
  setMobileOpen: (open: boolean) => void
  toggleDesktop: () => void
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  mobileOpen: false,
  desktopExpanded: true,
  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleDesktop: () => set((state) => ({ desktopExpanded: !state.desktopExpanded })),
}))
