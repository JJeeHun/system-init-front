import { create } from "zustand"

export type TabItem = {
  path: string
  routeId: string
  menuId: string | null
  permissionSignature: string
  revision: number
}

type TabsState = {
  openTabs: TabItem[]
  openTab: (tab: TabItem) => void
  replaceTabs: (tabs: TabItem[]) => void
  closeTab: (path: string) => void
  refreshTab: (path: string) => void
  resetTabs: () => void
}

export const useTabsStore = create<TabsState>()((set) => ({
  openTabs: [],
  openTab: (tab) => set((state) => (
    state.openTabs.some((current) => current.path === tab.path)
      ? state
      : { openTabs: [...state.openTabs, tab] }
  )),
  replaceTabs: (tabs) => set({ openTabs: tabs }),
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
  resetTabs: () => set((state) => (
    state.openTabs.length ? { openTabs: [] } : state
  )),
}))
