import type { ComponentType } from "react"
import { matchPath } from "react-router-dom"

import { CommonCodePage } from "@/pages/CommonCodePage"
import { ForbiddenPage } from "@/pages/ForbiddenPage"
import { HomePage } from "@/pages/HomePage"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { MenuPage } from "@/pages/MenuPage"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { UserManagementPage } from "@/pages/UserManagementPage"

const prefixes = {
  app: "/app",
} as const

type RouteDefinition = {
  prefix: keyof typeof prefixes
  path: string
  mode: "tab" | "page"
  titleKey: string
  Component: ComponentType
}

export const routeConfig = {
  home: { prefix: "app", path: "", mode: "page", titleKey: "home:title", Component: HomePage },
  forbidden: { prefix: "app", path: "/forbidden", mode: "page", titleKey: "auth:forbidden.title", Component: ForbiddenPage },
  commonCode: { prefix: "app", path: "/master/common-code", mode: "tab", titleKey: "navigation:menu.common-code", Component: CommonCodePage },
  menus: { prefix: "app", path: "/system/menus", mode: "tab", titleKey: "navigation:menu.menu-management", Component: MenuManagementPage },
  users: { prefix: "app", path: "/system/users", mode: "tab", titleKey: "navigation:menu.user", Component: UserManagementPage },
  roles: { prefix: "app", path: "/system/roles", mode: "tab", titleKey: "navigation:menu.role", Component: RoleManagementPage },
  uiPlayground: { prefix: "app", path: "/dev/ui", mode: "tab", titleKey: "navigation:tabs.uiPlayground", Component: UiPlaygroundPage },
  menuFallback: { prefix: "app", path: "/*", mode: "tab", titleKey: "navigation:page.notFound", Component: MenuPage },
} as const satisfies Record<string, RouteDefinition>

export type RouteKey = keyof typeof routeConfig

export function routePath(key: RouteKey): string {
  const route = routeConfig[key]
  return prefixes[route.prefix] + route.path
}

export function resolveRoute(pathname: string) {
  for (const key of Object.keys(routeConfig) as RouteKey[]) {
    const match = matchPath({ path: routePath(key), end: true }, pathname)
    if (match) {
      return { key, path: pathname, route: routeConfig[key], params: match.params }
    }
  }
  return null
}
