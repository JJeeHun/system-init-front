import { matchPath } from "react-router-dom"

export const routeMetadata = {
  home: { path: "/app", mode: "page", access: "public", titleKey: "home:title" },
  forbidden: { path: "/app/forbidden", mode: "page", access: "public", titleKey: "auth:forbidden.title" },
  commonCode: { path: "/app/master/common-code", mode: "tab", access: "menu", titleKey: "navigation:menu.common-code" },
  menus: { path: "/app/system/menus", mode: "tab", access: "menu", titleKey: "navigation:menu.menu-management" },
  users: { path: "/app/system/users", mode: "tab", access: "menu", titleKey: "navigation:menu.user" },
  roles: { path: "/app/system/roles", mode: "tab", access: "menu", titleKey: "navigation:menu.role" },
  uiPlayground: { path: "/app/dev/ui", mode: "tab", access: "public", titleKey: "navigation:tabs.uiPlayground" },
  menuFallback: { path: "/app/*", mode: "tab", access: "menu", titleKey: "navigation:page.notFound" },
} as const

export type RouteKey = keyof typeof routeMetadata

export function routePath(key: RouteKey): string {
  return routeMetadata[key].path
}

export function matchAppRoute(pathname: string) {
  for (const key of Object.keys(routeMetadata) as RouteKey[]) {
    const match = matchPath({ path: routePath(key), end: true }, pathname)
    if (match) return { key, params: match.params, metadata: routeMetadata[key] }
  }
  return null
}
