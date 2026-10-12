// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"

import { getForbiddenGeneration, handleAuthResponseError, subscribeForbiddenNavigation } from "@/features/auth/api/auth-response"
import { getAuthSessionToken, getSessionEndReason, setAuthSession, clearAuthSession } from "@/features/auth/storage/auth-session"
import { AppError } from "@/shared/lib/app-error"

afterEach(() => { clearAuthSession() })

describe("global auth response handling", () => {
  it("clears the login state on unauthorized responses", () => {
    setAuthSession("mock-token", 3600)
    expect(handleAuthResponseError(new AppError("AUTH_UNAUTHORIZED", "expired"))).toBe(true)
    expect(getAuthSessionToken()).toBeNull()
    expect(getSessionEndReason()).toBe("unauthorized")
  })

  it("keeps the session and announces forbidden navigation on 403", () => {
    setAuthSession("mock-token", 3600)
    const before = getForbiddenGeneration()
    const listener = vi.fn()
    const unsubscribe = subscribeForbiddenNavigation(listener)

    expect(handleAuthResponseError(new AppError("AUTH_FORBIDDEN", "forbidden"))).toBe(true)
    expect(getAuthSessionToken()).toBe("mock-token")
    expect(getForbiddenGeneration()).toBe(before + 1)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })
})
