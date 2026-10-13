import { describe, expect, it } from "vitest"

import { roleSchema } from "@/features/role/schemas/role.schema"
import { roleSearchSchema } from "@/features/role/schemas/role-search.schema"
import { rolePermissionSchema } from "@/features/role/schemas/role-permission.schema"

const role = { id: "MY_ROLE", name: "Operator", description: " note " }

describe("role validation", () => {
  it("accepts valid role details and trims fields", () => {
    expect(roleSchema.parse(role).description).toBe("note")
  })

  it("rejects lowercase role ID and whitespace-only name", () => {
    const result = roleSchema.safeParse({ ...role, id: "role", name: " " })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.map(issue => issue.path[0])).toEqual(expect.arrayContaining(["id", "name"]))
  })

  it("validates permission action values and search input", () => {
    expect(rolePermissionSchema.safeParse({ grants: [{ menuId: "users", actions: ["view", "edit"] }] }).success).toBe(true)
    expect(rolePermissionSchema.safeParse({ grants: [{ menuId: "users", actions: ["unknown"] }] }).success).toBe(false)
    expect(roleSearchSchema.parse({ keyword: " manager " }).keyword).toBe("manager")
  })
})
