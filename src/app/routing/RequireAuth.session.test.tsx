// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RequireAuth } from "@/app/routing/RequireAuth"
import { clearAuthSession, setAuthSession } from "@/features/auth/storage/auth-session"

function LoginDestination() {
  const location = useLocation()
  return <p>{(location.state as { reason?: string } | null)?.reason ?? "login"}</p>
}

function renderProtectedPage() {
  render(
    <MemoryRouter initialEntries={["/app/system/users"]}>
      <Routes>
        <Route path="/app/system/users" element={<RequireAuth><p>protected page</p></RequireAuth>} />
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  clearAuthSession()
  vi.useRealTimers()
})

describe("protected session route", () => {
  it("keeps a valid session after a protected route mounts", () => {
    setAuthSession("mock-token", 3600)
    renderProtectedPage()
    expect(screen.getByText("protected page")).toBeInTheDocument()
  })

  it("redirects to login with an expiry reason when a session expires", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-12T00:00:00Z"))
    setAuthSession("mock-token", 1)
    renderProtectedPage()

    expect(screen.getByText("protected page")).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText("expired")).toBeInTheDocument()
    expect(screen.queryByText("protected page")).not.toBeInTheDocument()
  })

  it("redirects immediately after manual logout", () => {
    setAuthSession("mock-token", 3600)
    renderProtectedPage()
    act(() => { clearAuthSession() })
    expect(screen.getByText("login")).toBeInTheDocument()
  })
})
