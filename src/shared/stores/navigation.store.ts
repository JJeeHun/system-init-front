import { create } from "zustand"

type NavigationState = {
  selectedRootMenuId: string | null
  selectRootMenu: (id: string) => void
  resetSelection: () => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  selectedRootMenuId: null,
  selectRootMenu: (id) => set({ selectedRootMenuId: id }),
  resetSelection: () => set({ selectedRootMenuId: null }),
}))
