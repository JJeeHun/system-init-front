import { create } from "zustand"

export type TabItem = {
  path: string
  revision: number
}

type TabsState = {
  openTabs: TabItem[]
  openTab: (path: string) => void
  closeTab: (path: string) => void
  refreshTab: (path: string) => void
  resetTabs: () => void
}

export const useTabsStore = create<TabsState>()((set) => ({
  openTabs: [],
  openTab: (path) => set((state) => (
    state.openTabs.some((tab) => tab.path === path)
      ? state
      : { openTabs: [...state.openTabs, { path, revision: 0 }] }
  )),
  closeTab: (path) => set((state) => (
    state.openTabs.some((tab) => tab.path === path)
      ? { openTabs: state.openTabs.filter((tab) => tab.path !== path) }
      : state
  )),
  refreshTab: (path) => set((state) => (
    state.openTabs.some((tab) => tab.path === path)
      ? {
          openTabs: state.openTabs.map((tab) => (
            tab.path === path ? { ...tab, revision: tab.revision + 1 } : tab
          )),
        }
      : state
  )),
  resetTabs: () => set({ openTabs: [] }),
}))
