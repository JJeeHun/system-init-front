import { afterEach, describe, expect, it } from "vitest"

import { createMockRole, getMockRolePermissions, listMockRoles, resetMockRolesForTest, saveMockRolePermissions, updateMockRole } from "@/features/role/api/role-management.mock"
import { getMenuRecordsSnapshot, resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { canDelegateAction } from "@/features/role/lib/role-delegation"

afterEach(() => {
  resetMockRolesForTest()
  resetMockMenusForTest()
})

describe("role delegation boundaries", () => {
  it("separates SYSTEM menu management from general menu permissions", () => {
    const menus = getMenuRecordsSnapshot()
    const actor = listMockRoles().find(role => role.id === "ADMIN")!
    const systemMenu = menus.find(menu => menu.id === "menu-management")!
    const userMenu = menus.find(menu => menu.id === "user")!
    expect(systemMenu.scope).toBe("SYSTEM")
    expect(userMenu.scope).toBe("GENERAL")
    expect(canDelegateAction(actor, systemMenu, "view")).toBe(false)
    expect(canDelegateAction(actor, userMenu, "delete")).toBe(true)
  })

  it("prevents self and higher-level role changes, even with role edit permissions", () => {
    saveMockRolePermissions({ roleId: "MANAGER", grants: [
      { menuId: "role", actions: ["view", "edit"] },
      { menuId: "user", actions: ["view", "create", "edit"] },
    ] }, "ADMIN")

    const manager = listMockRoles().find(role => role.id === "MANAGER")!
    const admin = listMockRoles().find(role => role.id === "ADMIN")!

    expect(() => updateMockRole("MANAGER", { id: "MANAGER", name: "Escalated", description: "" }, "MANAGER"))
      .toThrowError(expect.objectContaining({ code: "ROLE_MANAGEMENT_FORBIDDEN" }))
    expect(() => updateMockRole("ADMIN", { id: "ADMIN", name: "Escalated", description: "" }, "MANAGER"))
      .toThrowError(expect.objectContaining({ code: "ROLE_MANAGEMENT_FORBIDDEN" }))
    expect(() => updateMockRole("SYSTEM", { id: "SYSTEM", name: "Escalated", description: "" }, "ADMIN"))
      .toThrowError(expect.objectContaining({ code: "ROLE_MANAGEMENT_FORBIDDEN" }))
    expect(manager.level).toBeLessThan(admin.level)
  })

  it("allows only explicitly delegated action changes for lower roles", () => {
    const delegation = {
      roleId: "MANAGER",
      grants: [
        { menuId: "role", actions: ["view", "edit"] as const },
        { menuId: "user", actions: ["view", "create", "edit"] as const },
      ],
    }
    saveMockRolePermissions({ roleId: delegation.roleId,
      grants: delegation.grants.map(grant => ({ menuId: grant.menuId, actions: [...grant.actions] }))
    }, "ADMIN")

    const allowed = saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view", "create"] },
      { menuId: "common-code", actions: ["view"] },
    ] }, "MANAGER")
    expect(allowed.grants.find(grant => grant.menuId === "user")?.actions).toContain("create")

    expect(() => saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view", "create", "delete"] },
      { menuId: "common-code", actions: ["view"] },
    ] }, "MANAGER")).toThrowError(expect.objectContaining({ code: "ROLE_DELEGATION_FORBIDDEN" }))

    expect(() => saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view", "create"] },
      { menuId: "menu-management", actions: ["view"] },
      { menuId: "common-code", actions: ["view"] },
    ] }, "MANAGER")).toThrowError(expect.objectContaining({ code: "ROLE_DELEGATION_FORBIDDEN" }))
    expect(getMockRolePermissions("STAFF").grants.find(grant => grant.menuId === "user")?.actions)
      .toEqual(["view", "create"])
  })

  it("preserves protected permissions unchanged, but rejects unauthorized revocation", () => {
    saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view"] },
      { menuId: "menu-management", actions: ["view"] },
    ] }, "SYSTEM")

    saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view", "create"] },
      { menuId: "menu-management", actions: ["view"] },
    ] }, "ADMIN")
    expect(getMockRolePermissions("STAFF").grants.find(grant => grant.menuId === "menu-management")?.actions)
      .toEqual(["view"])

    expect(() => saveMockRolePermissions({ roleId: "STAFF", grants: [
      { menuId: "user", actions: ["view"] },
    ] }, "ADMIN")).toThrowError(expect.objectContaining({ code: "ROLE_DELEGATION_FORBIDDEN" }))
  })

  it("assigns new custom roles a lower immutable management level", () => {
    const custom = createMockRole({ id: "REVIEWER", name: "Reviewer", description: "" }, "ADMIN")
    expect(custom.level).toBe(100)
    expect(updateMockRole(custom.id, { id: custom.id, name: "Review Lead", description: "" }, "ADMIN").level)
      .toBe(100)
  })
})
