import { createContext, useContext, type ReactNode } from "react"

import type { NavigationPermissions } from "@/features/navigation/types/navigation.types"

type PagePermissionValue = {
  menuId: string | null
  permissions?: NavigationPermissions
  bypassCrudPermissions: boolean
}

const PagePermissionContext = createContext<PagePermissionValue | null>(null)

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
