import { afterEach, describe, expect, it } from "vitest"

import { getNavigationMenus } from "@/features/navigation/api/navigation.api"
import { buildVisibleMenus, createMockMenu, resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { findMenuByPath } from "@/features/navigation/lib/navigation-menu"
import { getMockRolePermissions, resetMockRolesForTest } from "@/features/role/api/role-management.mock"

afterEach(() => {
  resetMockMenusForTest()
  resetMockRolesForTest()
})

describe("current user navigation mock", () => {
  it("returns the signed-in user's menu with action permissions", async () => {
    const menus = await getNavigationMenus()
    expect(findMenuByPath(menus, "/app/system/users")?.permissions)
      .toEqual(["view", "create", "edit", "delete"])
  })

  it("hides pages without view permission and omits empty groups", () => {
    const menus = buildVisibleMenus(getMockRolePermissions("STAFF").grants)
    expect(findMenuByPath(menus, "/app/system/users")?.permissions).toEqual(["view"])
    expect(findMenuByPath(menus, "/app/master/common-code")?.permissions).toEqual(["view"])
    expect(findMenuByPath(menus, "/app/system/roles")).toBeNull()
    expect(findMenuByPath(menus, "/app/system/menus")).toBeNull()
    expect(buildVisibleMenus([])).toEqual([])
  })

  it("shows only the delegated actions for a manager", () => {
    const menus = buildVisibleMenus(getMockRolePermissions("MANAGER").grants)
    expect(findMenuByPath(menus, "/app/system/users")?.permissions).toEqual(["view", "create", "edit"])
    expect(findMenuByPath(menus, "/app/master/common-code")).toBeNull()
  })

  it("includes a newly created menu for the system administrator", () => {
    createMockMenu({
      id: "custom-screen",
      parentId: "system-settings",
      label: "새 화면",
      kind: "page",
      path: "/app/system/custom",
      icon: "settings",
      sortOrder: 30,
      enabled: true,
      scope: "GENERAL",
    })
    const menus = buildVisibleMenus(getMockRolePermissions("SYSTEM").grants, true)
    expect(findMenuByPath(menus, "/app/system/custom")?.permissions)
      .toEqual(["view", "create", "edit", "delete"])
  })
})
