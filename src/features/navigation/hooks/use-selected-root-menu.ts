import { useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"

import { findRootMenuByPath } from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

import { useNavigationStore } from "@/shared/stores"

export function useSelectedRootMenu(menus: NavigationMenuItem[]) {
  const { pathname, key } = useLocation()
  const selectedRootMenuId = useNavigationStore((state) => state.selectedRootMenuId)
  const selectedLocationKey = useNavigationStore((state) => state.selectedLocationKey)

  useLayoutEffect(() => {
    useNavigationStore.getState().resetSelection()
  }, [key])

  const selectedRootMenu = (
    selectedLocationKey === key
      ? menus.find((menu) => menu.id === selectedRootMenuId)
      : null
  ) ?? findRootMenuByPath(menus, pathname) ?? menus[0] ?? null

  const selectRootMenu = (id: string) => {
    useNavigationStore.getState().selectRootMenu(id, key)
  }

  return { selectedRootMenu, selectRootMenu }
}
