import { useCallback, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"

import { navigationQueries } from "@/features/navigation/api/navigation.api"
import {
  findMenuByPath,
  findRootMenuByPath,
  getFirstMenuPath,
} from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { useToggle } from "@/shared/hooks/use-toggle"

export function useMainNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebar = useToggle()

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

  useEffect(() => {
    if (location.pathname !== "/app" || menus.length === 0) {
      return
    }

    const firstPath = getFirstMenuPath(menus[0])

    if (firstPath) {
      navigate(firstPath, { replace: true })
    }
  }, [location.pathname, menus, navigate])

  const selectRootMenu = useCallback(
    (menu: NavigationMenuItem) => {
      const path = getFirstMenuPath(menu)

      if (path) {
        navigate(path)
      }
    },
    [navigate],
  )

  return {
    menus,
    sidebarMenus: activeRootMenu?.children ?? [],
    activeRootMenu,
    currentMenu,
    isLoading: navigationQuery.isLoading,
    isError: navigationQuery.isError,
    sidebarOpen: sidebar.value,
    openSidebar: sidebar.on,
    closeSidebar: sidebar.off,
    selectRootMenu,
  }
}
