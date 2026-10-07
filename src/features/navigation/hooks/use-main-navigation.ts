import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"

import { navigationQueries } from "@/features/navigation/api/navigation.query"
import {
  findMenuByPath,
  findRootMenuByPath,
  getActiveMenuIds,
  getFirstMenuPath,
} from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { useToggle } from "@/shared/hooks/use-toggle"

export function useMainNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebar = useToggle()

  const navigationQuery = useQuery(navigationQueries.bootstrap())
  const menus = navigationQuery.data?.menus ?? []

  const activeRootMenu = useMemo(
    () => findRootMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  const currentMenu = useMemo(
    () => findMenuByPath(menus, location.pathname),
    [location.pathname, menus],
  )

  const activeMenuIds = useMemo(
    () => getActiveMenuIds(menus, location.pathname),
    [location.pathname, menus],
  )

  useEffect(() => {
    if (location.pathname !== "/app" || menus.length === 0) {
      return
    }

    const firstPath = getFirstMenuPath(menus[0])

    if (firstPath) {
      navigate(firstPath, { replace: true })
    }
  }, [location.pathname, menus, navigate])

  useEffect(() => {
    sidebar.off()
  }, [location.pathname, sidebar.off])

  function selectRootMenu(menu: NavigationMenuItem) {
    const path = getFirstMenuPath(menu)

    if (path) {
      navigate(path)
    }
  }

  return {
    user: navigationQuery.data?.user ?? null,
    menus,
    sidebarMenus: activeRootMenu?.children ?? [],
    activeRootMenu,
    currentMenu,
    activeMenuIds,
    isLoading: navigationQuery.isLoading,
    isError: navigationQuery.isError,
    sidebarOpen: sidebar.value,
    openSidebar: sidebar.on,
    closeSidebar: sidebar.off,
    selectRootMenu,
  }
}
