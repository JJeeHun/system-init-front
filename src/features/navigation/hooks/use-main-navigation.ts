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

  const activeRootMenu = useMemo(
    () => findRootMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  const currentMenu = useMemo(
    () => findMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  // A route change takes precedence over a category selected for browsing.
  useEffect(() => {
    setSelectedRootId(null)
  }, [location.pathname])

  const selectedRootMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedRootId) ?? activeRootMenu,
    [menus, selectedRootId, activeRootMenu],
  )

  return {
    menus,
    sidebarMenus: selectedRootMenu?.children ?? [],
    selectedRootMenu,
    selectRootMenu: (menu: NavigationMenuItem) => setSelectedRootId(menu.id),
    activeRootMenu,
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
