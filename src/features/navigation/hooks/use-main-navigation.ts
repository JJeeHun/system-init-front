import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "react-router-dom"

import { navigationQueries } from "@/features/navigation/api/navigation.api"
import {
  findMenuByPath,
  findRootMenuByPath,
} from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { useToggle } from "@/shared/hooks/use-toggle"

export function useMainNavigation() {
  const location = useLocation()
  const sidebar = useToggle()
  const desktopSidebar = useToggle(true)
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null)

  const navigationQuery = useQuery(navigationQueries.menus())
  const menus = navigationQuery.data ?? []

  const routeRootMenu = useMemo(
    () => findRootMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  const currentMenu = useMemo(
    () => findMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  // Update the category when navigating to an actual menu page.
  // Home has no active menu and must keep the last selected category.
  useEffect(() => {
    if (routeRootMenu) {
      setSelectedRootId(routeRootMenu.id)
    }
  }, [routeRootMenu])

  const selectedRootMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedRootId) ?? routeRootMenu ?? menus[0] ?? null,
    [menus, selectedRootId, routeRootMenu],
  )

  return {
    menus,
    sidebarMenus: selectedRootMenu?.children ?? [],
    selectedRootMenu,
    selectRootMenu: (menu: NavigationMenuItem) => setSelectedRootId(menu.id),
    routeRootMenu,
    currentMenu,
    isLoading: navigationQuery.isLoading,
    isError: navigationQuery.isError,
    sidebarOpen: sidebar.value,
    desktopSidebarOpen: desktopSidebar.value,
    toggleDesktopSidebar: desktopSidebar.toggle,
    openSidebar: sidebar.on,
    closeSidebar: sidebar.off,
  }
}
