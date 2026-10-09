import { afterEach, describe, expect, it } from "vitest"

import { createMockUser, listMockUsersPage, resetMockUsersForTest } from "@/features/user/api/user-management.mock"

const filters = { keyword: "", status: "all" as const, role: "all" as const }

afterEach(resetMockUsersForTest)

describe("user management server-style pagination", () => {
  it("returns only the requested page with a separate total count", () => {
    for (let index = 0; index < 23; index++) {
      createMockUser({ id: `added${index}`, name: `New ${index}`, email: `new${index}@example.com`, center: "SEOUL", role: "STAFF", enabled: true })
    }
    const first = listMockUsersPage({ ...filters, page: 1, pageSize: 20 })
    const second = listMockUsersPage({ ...filters, page: 2, pageSize: 20 })
    expect(first.totalCount).toBe(28)
    expect(first.items).toHaveLength(20)
    expect(second.totalCount).toBe(28)
    expect(second.items).toHaveLength(8)
    expect(new Set([...first.items, ...second.items].map(user => user.id)).size).toBe(28)
  })

  it("filters before paginating and returns an empty page when out of range", () => {
    const result = listMockUsersPage({ keyword: "user03", status: "disabled", role: "STAFF", page: 1, pageSize: 20 })
    expect(result.totalCount).toBe(1)
    expect(result.items.map(user => user.id)).toEqual(["user03"])
    expect(listMockUsersPage({ ...filters, page: 2, pageSize: 20 })).toEqual({ items: [], totalCount: 5 })
  })
})
