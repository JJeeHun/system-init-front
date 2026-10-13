import type { ComponentType } from "react"

import { CommonCodePage } from "@/pages/CommonCodePage"
import { ForbiddenPage } from "@/pages/ForbiddenPage"
import { HomePage } from "@/pages/HomePage"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { MenuPage } from "@/pages/MenuPage"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { UserManagementPage } from "@/pages/UserManagementPage"
import { matchAppRoute, routeMetadata } from "@/app/routing/route-metadata"
import type { RouteKey } from "@/app/routing/route-metadata"

export { routePath } from "@/app/routing/route-metadata"
export type { RouteKey } from "@/app/routing/route-metadata"

type PageComponent = ComponentType<{ path: string }>

export const routeConfig: Record<RouteKey, { path: string; mode: "tab" | "page"; access: "public" | "menu"; titleKey: string; Component: PageComponent }> = {
  home: { ...routeMetadata.home, Component: HomePage },
  forbidden: { ...routeMetadata.forbidden, Component: ForbiddenPage },
  commonCode: { ...routeMetadata.commonCode, Component: CommonCodePage },
  menus: { ...routeMetadata.menus, Component: MenuManagementPage },
  users: { ...routeMetadata.users, Component: UserManagementPage },
  roles: { ...routeMetadata.roles, Component: RoleManagementPage },
  uiPlayground: { ...routeMetadata.uiPlayground, Component: UiPlaygroundPage },
  menuFallback: { ...routeMetadata.menuFallback, Component: MenuPage },
}

export function resolveRoute(pathname: string) {
  const match = matchAppRoute(pathname)
  if (!match) return null
  return { key: match.key, path: pathname, route: routeConfig[match.key], params: match.params }
}
