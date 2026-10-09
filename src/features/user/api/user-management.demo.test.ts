import { afterEach, describe, expect, it } from "vitest"

import { ensureDemoMockUsers, listMockUsersPage, resetMockUsersForTest } from "@/features/user/api/user-management.mock"

const filters = { keyword: "", status: "all" as const, role: "all" as const }

afterEach(resetMockUsersForTest)

describe("user management demo pagination data", () => {
  it("supplies 67 unique users across 20-item pages, including the final partial page", () => {
    ensureDemoMockUsers()
    ensureDemoMockUsers()

    const pages = [1, 2, 3, 4].map(page => listMockUsersPage({ ...filters, page, pageSize: 20 }))
    expect(pages.map(result => result.items.length)).toEqual([20, 20, 20, 7])
    expect(pages.every(result => result.totalCount === 67)).toBe(true)
    expect(new Set(pages.flatMap(result => result.items.map(user => user.id))).size).toBe(67)
  })

  it("supports 50-item pages and filtering by role and status", () => {
    ensureDemoMockUsers()
    expect(listMockUsersPage({ ...filters, page: 2, pageSize: 50 }).items).toHaveLength(17)
    const admins = listMockUsersPage({ keyword: "", status: "enabled", role: "ADMIN", page: 1, pageSize: 100 })
    expect(admins.items.length).toBeGreaterThan(1)
    expect(admins.items.every(user => user.role === "ADMIN" && user.enabled)).toBe(true)
  })
})
