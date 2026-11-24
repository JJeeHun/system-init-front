import { create } from "zustand"

type NavigationState = {
  selectedRootMenuId: string | null
  selectedLocationKey: string | null
  selectRootMenu: (id: string, locationKey: string) => void
  resetSelection: () => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  selectedRootMenuId: null,
  selectedLocationKey: null,
  selectRootMenu: (id, locationKey) => set({
    selectedRootMenuId: id,
    selectedLocationKey: locationKey,
  }),
  resetSelection: () => set({ selectedRootMenuId: null, selectedLocationKey: null }),
}))
