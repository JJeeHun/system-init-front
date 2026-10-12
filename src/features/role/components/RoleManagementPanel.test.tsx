// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { resetMockRolesForTest, getMockRolePermissions } from "@/features/role/api/role-management.mock"
import { resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { devSettings } from "@/shared/dev-tools/settings"
import { changeLanguage } from "@/shared/i18n"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(async () => {
  resetMockRolesForTest()
  resetMockMenusForTest()
  await act(async () => { await changeLanguage("ko") })
})

const waitOptions = { timeout: devSettings.mockDelayMs * 5 + 2000 }

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app/system/roles"]}>
        <Routes>
          <Route path="/app/system/roles" element={<RoleManagementPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("role management page", () => {
  it("creates a custom role through the form and lists it", async () => {
    renderPage()
    expect(await screen.findByRole("heading", { level: 1, name: "역할·권한 관리" }, waitOptions)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("button", { name: "역할 등록" })).toBeEnabled(), waitOptions)
    fireEvent.click(screen.getByRole("button", { name: "역할 등록" }))
    const editor = screen.getByRole("dialog", { name: "역할 등록" })
    fireEvent.change(within(editor).getByRole("textbox", { name: /역할 코드/ }), { target: { value: "REVIEWER" } })
    fireEvent.change(within(editor).getByRole("textbox", { name: /역할명/ }), { target: { value: "검수자" } })
    fireEvent.click(within(editor).getByRole("button", { name: "저장" }))
    expect(await screen.findByRole("button", { name: /검수자.*REVIEWER/ }, waitOptions)).toBeInTheDocument()
  }, devSettings.mockDelayMs * 8 + 2500)

  it("edits and saves STAFF role permissions without affecting ADMIN", async () => {
    renderPage()
    const roleList = screen.getByRole("heading", { name: "역할 목록" }).closest("section")!
    fireEvent.click(await within(roleList).findByRole("button", { name: /일반 사용자.*STAFF/ }, waitOptions))
    await waitFor(() => expect(document.getElementById("role-permission-user-view")).toBeChecked(), waitOptions)
    const userCreate = document.getElementById("role-permission-user-create")
    expect(userCreate).toBeEnabled()
    expect(userCreate).not.toBeChecked()
    fireEvent.click(userCreate!)
    fireEvent.click(screen.getByRole("button", { name: "저장" }))

    await waitFor(() => {
      expect(getMockRolePermissions("STAFF").grants.find(grant => grant.menuId === "user")?.actions)
        .toContain("create")
    }, waitOptions)
    expect(getMockRolePermissions("ADMIN").grants.find(grant => grant.menuId === "user")?.actions).toContain("delete")
  }, devSettings.mockDelayMs * 8 + 2500)
})
