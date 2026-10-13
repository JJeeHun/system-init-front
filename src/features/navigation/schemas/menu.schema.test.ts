import { describe, expect, it } from "vitest"

import { menuSchema } from "@/features/navigation/schemas/menu.schema"

const menu = { id: "my-menu", label: "Menu", parentId: null, kind: "page", path: "/app/users", icon: "users", sortOrder: 0, enabled: true, scope: "GENERAL" }

describe("menu validation", () => {
  it("requires a valid path only for page menus", () => {
    expect(menuSchema.safeParse({ ...menu, kind: "group", path: "" }).success).toBe(true)
    const noPath = menuSchema.safeParse({ ...menu, path: "" })
    expect(noPath.success).toBe(false)
    if (!noPath.success) expect(noPath.error.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ["path"], message: "navigation:management.validation.pathRequired" })]))
    expect(menuSchema.safeParse({ ...menu, path: "/other" }).success).toBe(false)
  })

  it("rejects invalid ID, empty name and non-integer or negative sort order", () => {
    expect(menuSchema.safeParse({ ...menu, id: "INVALID", label: " " }).success).toBe(false)
    expect(menuSchema.safeParse({ ...menu, sortOrder: 1.5 }).success).toBe(false)
    expect(menuSchema.safeParse({ ...menu, sortOrder: -1 }).success).toBe(false)
  })
})
