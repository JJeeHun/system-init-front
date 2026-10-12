import { afterEach, describe, expect, it } from "vitest"

import { createMockRole, deleteMockRole, getMockRolePermissions, listMockRoles, resetMockRolesForTest, saveMockRolePermissions, updateMockRole } from "@/features/role/api/role-management.mock"

afterEach(resetMockRolesForTest)

describe("role management mock contract", () => {
  it("keeps the four protected roles with fixed levels and prevents deleting them", () => {
    expect(listMockRoles().map(role => [role.id, role.level])).toEqual([["SYSTEM", 1000], ["ADMIN", 300], ["MANAGER", 200], ["STAFF", 100]])
    expect(updateMockRole("STAFF", { id: "STAFF", name: "운영 사용자", description: "일반 계정" }).name).toBe("운영 사용자")
    expect(() => deleteMockRole("STAFF")).toThrowError(expect.objectContaining({ code: "ROLE_IN_USE" }))
    expect(listMockRoles()).toHaveLength(4)
  })

  it("supports creating, updating and deleting custom roles without changing the built-in role IDs", () => {
    const input = { id: "REVIEWER", name: "검수 담당자", description: "검수 권한" }
    expect(createMockRole(input).id).toBe("REVIEWER")
    expect(() => createMockRole(input)).toThrowError(expect.objectContaining({ code: "ROLE_DUPLICATE_ID" }))
    expect(updateMockRole("REVIEWER", { ...input, name: "검수자" }).name).toBe("검수자")
    expect(() => updateMockRole("REVIEWER", { ...input, id: "CHANGED" })).toThrowError(expect.objectContaining({ code: "ROLE_INVALID_ID" }))
    deleteMockRole("REVIEWER")
    expect(listMockRoles()).toHaveLength(4)
    expect(() => getMockRolePermissions("REVIEWER")).toThrowError(expect.objectContaining({ code: "ROLE_NOT_FOUND" }))
  })

  it("stores independent role permissions, requires view access for actions and returns immutable snapshots", () => {
    expect(getMockRolePermissions("ADMIN").grants.find(grant => grant.menuId === "user")?.actions)
      .toEqual(["view", "create", "edit", "delete"])
    expect(getMockRolePermissions("STAFF").grants.find(grant => grant.menuId === "user")?.actions)
      .toEqual(["view"])

    const saved = saveMockRolePermissions({
      roleId: "STAFF",
      grants: [{ menuId: "user", actions: ["view", "create"] }],
    })
    saved.grants[0].actions.push("delete")
    expect(getMockRolePermissions("STAFF").grants).toEqual([{ menuId: "user", actions: ["view", "create"] }])
    expect(getMockRolePermissions("ADMIN").grants.find(grant => grant.menuId === "user")?.actions).toHaveLength(4)

    expect(() => saveMockRolePermissions({
      roleId: "STAFF",
      grants: [{ menuId: "user", actions: ["edit"] }],
    })).toThrowError(expect.objectContaining({ code: "ROLE_INVALID_PERMISSION" }))
    expect(getMockRolePermissions("STAFF").grants[0].actions).toEqual(["view", "create"])
  })
})
