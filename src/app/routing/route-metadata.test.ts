import { describe, expect, it } from "vitest"

import { app, resolveRoute, routeDefinitions, routeMenuDefinitions } from "@/app/routing/route-metadata"
import { CommonCodePage } from "@/pages/CommonCodePage"

describe("route definitions", () => {
  it("initializes physical paths once from the nested object keys", () => {
    expect(app.home.path).toBe("/app")
    expect(app.forbidden.path).toBe("/app/forbidden")
    expect(app.system.users.path).toBe("/app/system/users")
    expect(app.system.roles.path).toBe("/app/system/roles")
    expect(app.system.menus.path).toBe("/app/system/menus")
    expect(app.master.commonCode.path).toBe("/app/master/common-code")
    expect(app.dev.ui.path).toBe("/app/dev/ui")
    expect(app["*"].path).toBe("/app/*")
  })

  it("links the resolved route to the same component and metadata", () => {
    const match = resolveRoute(app.master.commonCode.path)
    expect(match?.route.Component).toBe(CommonCodePage)
    expect(match?.route.path).toBe(app.master.commonCode.path)
    expect(match?.route.menu?.id).toBe("common-code")
  })

  it("keeps menu groups and pages in a single definition tree", () => {
    expect(routeDefinitions.app.children.system.menu.id).toBe("system")
    expect(routeMenuDefinitions.map((menu) => menu.id)).toEqual([
      "system", "user-access", "system-settings", "user", "role", "menu-management", "common-code",
    ])
    expect(routeMenuDefinitions.find((menu) => menu.id === "common-code")?.path).toBe(app.master.commonCode.path)
    expect(routeMenuDefinitions.some((menu) => menu.path === app.home.path)).toBe(false)
    expect(routeMenuDefinitions.some((menu) => menu.path === app["*"].path)).toBe(false)
  })

  it("routes unregistered app URLs to the not-found page", () => {
    expect(resolveRoute("/app/does-not-exist")?.route).toBe(app["*"])
    expect(resolveRoute("/not-an-app-route")).toBeNull()
  })
})

if (false) {
  // @ts-expect-error Moving commonCode under system must invalidate old references.
  app.system.commonCode.path
  // @ts-expect-error The definitions do not have independently hardcoded paths.
  routeDefinitions.app.children.master.children.commonCode.path
}
