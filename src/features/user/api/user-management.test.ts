import { afterEach, describe, expect, it, vi } from "vitest"

import { changeUserEnabled, createUserAccount, getUserAccounts, updateUserAccount } from "@/features/user/api/user-management.api"
import { resetMockUsersForTest } from "@/features/user/api/user-management.mock"
import type { UserAccountInput, UserFilters } from "@/features/user/types/user-management.types"
import { devSettings } from "@/shared/dev-tools/settings"

const all: UserFilters = { keyword: "", status: "all", role: "all" }
const sample: UserAccountInput = { id: "tester06", name: "Test User", email: "test06@example.com", center: "SEOUL", role: "STAFF", enabled: true }

async function complete<T>(pending: Promise<T>): Promise<T> {
  await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
  return pending
}

afterEach(() => { resetMockUsersForTest(); vi.useRealTimers() })

describe("user management mock API", () => {
  it("filters users by keyword, role and status", async () => {
    vi.useFakeTimers()
    const promise = getUserAccounts({ keyword: "user03", role: "STAFF", status: "disabled" })
    const rows = await complete(promise)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: "user03", enabled: false })
  })

  it("creates and updates a user, then disables without deleting it", async () => {
    vi.useFakeTimers()
    const created = await complete(createUserAccount(sample))
    expect(created.id).toBe("tester06")
    const updated = await complete(updateUserAccount({ id: sample.id, request: { ...sample, name: "New Name" } }))
    expect(updated.name).toBe("New Name")
    await complete(changeUserEnabled({ id: sample.id, enabled: false }))
    const records = await complete(getUserAccounts({ ...all, status: "disabled" }))
    expect(records.find(user => user.id === sample.id)).toMatchObject({ name: "New Name", enabled: false })
    const originals = await complete(getUserAccounts(all))
    expect(originals).toHaveLength(6)
  })

  it("rejects duplicate user ID and email without corrupting the list", async () => {
    vi.useFakeTimers()
    const duplicated = createUserAccount({ ...sample, id: "admin01" })
    const duplicatedAssertion = expect(duplicated).rejects.toMatchObject({ code: "USER_DUPLICATE_ID" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await duplicatedAssertion

    const emailDup = createUserAccount({ ...sample, email: "user02@example.com" })
    const emailAssertion = expect(emailDup).rejects.toMatchObject({ code: "USER_DUPLICATE_EMAIL" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await emailAssertion

    const users = await complete(getUserAccounts(all))
    expect(users).toHaveLength(5)
  })
})
