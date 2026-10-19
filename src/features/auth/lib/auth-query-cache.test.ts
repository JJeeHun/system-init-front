// @vitest-environment jsdom
import { QueryClient } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"

import { handleAuthResponseError } from "@/features/auth/api/auth-response"
import { clearAuthQueryCache, subscribeAuthQueryCache } from "@/features/auth/lib/auth-query-cache"
import {
  clearAuthSession,
  getAuthSessionToken,
  getSessionEndReason,
  setAuthSession,
} from "@/features/auth/storage/auth-session"
import { AppError } from "@/shared/lib/app-error"

const protectedKeys = [
  ["user", "current"],
  ["user", "management", "list"],
  ["navigation", "menus"],
  ["role", "management", "permissions", "role-1"],
  ["filter", "role", "management"],
] as const

function seededClient() {
  const queryClient = new QueryClient()
  for (const key of protectedKeys) queryClient.setQueryData([...key], "previous-account")
  queryClient.setQueryData(["common-code", "groups"], "shared-data")
  queryClient.getMutationCache().build(queryClient, { mutationFn: async () => "previous-account" })
  return queryClient
}

function expectAccountCacheCleared(queryClient: QueryClient) {
  for (const key of protectedKeys) {
    expect(queryClient.getQueryData([...key])).toBeUndefined()
  }
  expect(queryClient.getQueryData(["common-code", "groups"])).toBe("shared-data")
}

afterEach(() => {
  clearAuthSession()
  vi.useRealTimers()
})

describe("account-scoped React Query cache", () => {
  it("clears only account-dependent queries when the user logs out", () => {
    setAuthSession("admin-token", 3600, "admin")
    const client = seededClient()
    const unsubscribe = subscribeAuthQueryCache(client)

    clearAuthSession()
    expectAccountCacheCleared(client)
    expect(client.getMutationCache().getAll()).toHaveLength(0)
    unsubscribe()
  })

  it("clears account queries on automatic session expiration", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-19T00:00:00Z"))
    setAuthSession("short-token", 1, "admin")
    const client = seededClient()
    const unsubscribe = subscribeAuthQueryCache(client)

    vi.advanceTimersByTime(1000)
    expect(getAuthSessionToken()).toBeNull()
    expect(getSessionEndReason()).toBe("expired")
    expectAccountCacheCleared(client)
    expect(client.getMutationCache().getAll()).toHaveLength(0)
    unsubscribe()
  })

  it("clears cached identity and permissions on 401, but keeps them on 403", () => {
    setAuthSession("admin-token", 3600, "admin")
    const client = seededClient()
    const unsubscribe = subscribeAuthQueryCache(client)

    handleAuthResponseError(new AppError("AUTH_FORBIDDEN", "forbidden"))
    expect(client.getQueryData(["user", "current"])).toBe("previous-account")
    expect(client.getMutationCache().getAll()).toHaveLength(1)

    handleAuthResponseError(new AppError("AUTH_UNAUTHORIZED", "unauthorized"))
    expect(getAuthSessionToken()).toBeNull()
    expect(getSessionEndReason()).toBe("unauthorized")
    expectAccountCacheCleared(client)
    expect(client.getMutationCache().getAll()).toHaveLength(0)
    unsubscribe()
  })

  it("starts a different account without the previous user's cached data", () => {
    setAuthSession("admin-token", 3600, "admin")
    const client = seededClient()

    clearAuthQueryCache(client)
    setAuthSession("staff-token", 3600, "staff")

    expect(getAuthSessionToken()).toBe("staff-token")
    expectAccountCacheCleared(client)
  })
})
