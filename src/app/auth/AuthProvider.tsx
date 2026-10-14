import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"

import { resolveRoute } from "@/app/routing/route-metadata"
import { navigationQueries } from "@/features/navigation/api/navigation.api"
import type { NavigationMenuItem, NavigationPermissions } from "@/features/navigation/types/navigation.types"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"
import type { CurrentUser } from "@/features/user/types/user.types"

type AuthContextValue = {
  user: CurrentUser | null
  allowedMenus: NavigationMenuItem[]
  isLoading: boolean
  isError: boolean
  getMenuPermissions: (menuId: string) => NavigationPermissions | undefined
  canAccessRoute: (path: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)
const EMPTY_MENUS: NavigationMenuItem[] = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const userQuery = useCurrentUser()
  const menuQuery = useQuery(navigationQueries.menus())

  const isLoading = userQuery.isPending || menuQuery.isPending
  const isError = userQuery.isError || menuQuery.isError
  const user = !isError ? userQuery.data ?? null : null
  const allowedMenus = !isError ? menuQuery.data ?? EMPTY_MENUS : EMPTY_MENUS

  const permissionsById = useMemo(() => {
    const permissions = new Map<string, NavigationPermissions>()

    function collect(menus: readonly NavigationMenuItem[]) {
      for (const menu of menus) {
        if (menu.path && menu.permissions) permissions.set(menu.id, menu.permissions)
        if (menu.children) collect(menu.children)
      }
    }

    collect(allowedMenus)
    return permissions
  }, [allowedMenus])

  const getMenuPermissions = useCallback(
    (menuId: string) => permissionsById.get(menuId),
    [permissionsById],
  )

  const canAccessRoute = useCallback((path: string) => {
    const match = resolveRoute(path)
    if (!match) return false
    if (match.route.access === "public") return true
    if (isLoading || isError) return false
    return getMenuPermissions(match.route.menu.id)?.isView === true
  }, [getMenuPermissions, isError, isLoading])

  const value = useMemo(() => ({
    user,
    allowedMenus,
    isLoading,
    isError,
    getMenuPermissions,
    canAccessRoute,
  }), [user, allowedMenus, isLoading, isError, getMenuPermissions, canAccessRoute])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
