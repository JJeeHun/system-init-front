// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  clearAuthSession,
  getAuthSession,
  getAuthSessionToken,
  getSessionEndReason,
  setAuthSession,
  subscribeAuthSession,
} from "@/features/auth/storage/auth-session"

afterEach(() => {
  clearAuthSession()
  vi.useRealTimers()
})

describe("auth session storage", () => {
  it("restores a valid session from sessionStorage", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-12T00:00:00Z"))
    setAuthSession("mock-token", 60)

    expect(getAuthSessionToken()).toBe("mock-token")
    expect(getAuthSession()?.expiresAt).toBe(Date.now() + 60_000)
    expect(sessionStorage.getItem("system-init-front.auth")).toContain("mock-token")
  })

  it("notifies subscribers when the session expires and clears the stored token", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-12T00:00:00Z"))
    const listener = vi.fn()
    const unsubscribe = subscribeAuthSession(listener)

    setAuthSession("short-token", 1)
    vi.advanceTimersByTime(1000)

    expect(getAuthSessionToken()).toBeNull()
    expect(getSessionEndReason()).toBe("expired")
    expect(sessionStorage.getItem("system-init-front.auth")).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
  })

  it("discards invalid stored sessions", () => {
    sessionStorage.setItem("system-init-front.auth", "{broken")
    expect(getAuthSession()).toBeNull()
    expect(sessionStorage.getItem("system-init-front.auth")).toBeNull()
  })
})
