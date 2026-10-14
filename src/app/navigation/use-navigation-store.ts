import { create } from "zustand"
import type { NavigateFunction, NavigateOptions } from "react-router-dom"

import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { resolveRoute } from "@/app/routing/route-metadata"

type MenuEntry = { menu: NavigationMenuItem; root: NavigationMenuItem }
type MenuIndex = Readonly<Record<string, MenuEntry>>
type NavigationTarget = `/${string}`

const EMPTY_MENUS: NavigationMenuItem[] = []
const EMPTY_INDEX: MenuIndex = {}
let routerNavigate: NavigateFunction | null = null

function buildMenuIndex(menus: NavigationMenuItem[]): MenuIndex {
  const index: Record<string, MenuEntry> = {}

  function visit(menu: NavigationMenuItem, root: NavigationMenuItem) {
    if (menu.path) index[menu.path] = { menu, root }
    for (const child of menu.children ?? []) visit(child, root)
  }

  for (const root of menus) visit(root, root)
  return index
}

function findMenuEntry(index: MenuIndex, pathname: string): MenuEntry | null {
  let path = pathname.replace(/\/$/, "")
  while (path) {
    if (Object.prototype.hasOwnProperty.call(index, path)) return index[path]
    const separator = path.lastIndexOf("/")
    if (separator <= 0) break
    path = path.slice(0, separator)
  }
  return null
}

export function connectNavigationRouter(navigate: NavigateFunction) {
  routerNavigate = navigate
  return () => {
    if (routerNavigate === navigate) routerNavigate = null
  }
}

type NavigationState = {
  menus: NavigationMenuItem[]
  menuIndex: MenuIndex
  hasLoadedMenus: boolean
  isLoading: boolean
  isError: boolean
  currentPath: string
  selectedRootId: string | null
  isMobileSidebarOpen: boolean
  isDesktopSidebarExpanded: boolean
  findMenu: (path: string) => NavigationMenuItem | null
  findRootMenu: (path: string) => NavigationMenuItem | null
  canAccess: (path: string) => boolean
  navigateTo: (target: NavigationTarget, options?: NavigateOptions) => boolean
  selectRootMenu: (id: string) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleDesktopSidebar: () => void
  updateMenuQuery: (result: { data?: NavigationMenuItem[]; isPending: boolean; isError: boolean }) => void
  updateCurrentPath: (path: string) => void
  resetNavigation: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  menus: EMPTY_MENUS,
  menuIndex: EMPTY_INDEX,
  hasLoadedMenus: false,
  isLoading: true,
  isError: false,
  currentPath: "",
  selectedRootId: null,
  isMobileSidebarOpen: false,
  isDesktopSidebarExpanded: true,

  findMenu: (path) => findMenuEntry(get().menuIndex, path)?.menu ?? null,
  findRootMenu: (path) => findMenuEntry(get().menuIndex, path)?.root ?? null,
  canAccess: (path) => {
    const match = resolveRoute(path)
    if (!match) return false
    if (match.route.access === "public") return true
    return get().hasLoadedMenus && get().findMenu(path) !== null
  },
  navigateTo: (target, options) => {
    const path = target
    if (!routerNavigate || !get().canAccess(path)) return false
    void routerNavigate(path, options)
    return true
  },
  selectRootMenu: (id) => set({ selectedRootId: id }),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleDesktopSidebar: () => set((state) => ({ isDesktopSidebarExpanded: !state.isDesktopSidebarExpanded })),
  updateMenuQuery: ({ data, isPending, isError }) => {
    const previous = get()
    const menus = data ?? (previous.hasLoadedMenus ? previous.menus : EMPTY_MENUS)
    const menuIndex = menus === previous.menus ? previous.menuIndex : buildMenuIndex(menus)
    const currentRoot = findMenuEntry(menuIndex, previous.currentPath)?.root ?? null
    const next = {
      menus,
      menuIndex,
      hasLoadedMenus: data !== undefined || previous.hasLoadedMenus,
      isLoading: data === undefined && isPending,
      isError: data === undefined && !previous.hasLoadedMenus && isError,
      selectedRootId: currentRoot?.id ?? previous.selectedRootId,
    }
    if (Object.keys(next).every((key) => previous[key as keyof typeof next] === next[key as keyof typeof next])) return
    set(next)
  },
  updateCurrentPath: (path) => {
    const previous = get()
    const rootId = previous.findRootMenu(path)?.id ?? previous.selectedRootId
    if (previous.currentPath !== path || previous.selectedRootId !== rootId) {
      set({ currentPath: path, selectedRootId: rootId })
    }
  },
  resetNavigation: () => set({
    menus: EMPTY_MENUS,
    menuIndex: EMPTY_INDEX,
    hasLoadedMenus: false,
    isLoading: true,
    isError: false,
    currentPath: "",
    selectedRootId: null,
    isMobileSidebarOpen: false,
    isDesktopSidebarExpanded: true,
  }),
}))
