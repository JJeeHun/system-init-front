import { createContext, useContext, type ReactNode } from "react"

import type { NavigationPermissions } from "@/features/navigation/types/navigation.types"

type PagePermissionValue = {
  menuId: string | null
  permissions?: NavigationPermissions
  bypassCrudPermissions: boolean
}

const PagePermissionContext = createContext<PagePermissionValue | null>(null)

export type PageAction = "view" | "create" | "edit" | "delete"

const actionKeys = {
  view: "isView",
  create: "isCreated",
  edit: "isUpdated",
  delete: "isDeleted",
} as const

export function usePageActionPermission(action: PageAction): boolean {
  const scope = useContext(PagePermissionContext)
  // Unscoped and public search panels remain available.
  if (!scope || scope.menuId === null) return action === "view"
  if (action === "view") return scope.permissions?.isView === true
  if (scope.bypassCrudPermissions) return true
  return scope.permissions?.[actionKeys[action]] === true
}

export function PagePermissionScope({
  children,
  menuId,
  permissions,
  bypassCrudPermissions,
}: PagePermissionValue & { children: ReactNode }) {
  return (
    <PagePermissionContext.Provider value={{ menuId, permissions, bypassCrudPermissions }}>
      {children}
    </PagePermissionContext.Provider>
  )
}

export function usePagePermissionScope(): PagePermissionValue | null {
  return useContext(PagePermissionContext)
}
