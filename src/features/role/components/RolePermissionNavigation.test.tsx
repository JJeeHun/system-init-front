// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { resetMockRolesForTest } from "@/features/role/api/role-management.mock"
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

describe("role menu permission navigation", () => {
  it("shows one selected menu's actions and navigates the collapsible menu hierarchy", async () => {
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

    await waitFor(() => {
      expect(document.getElementById("role-permission-user-view")).toBeChecked()
    }, waitOptions)
    expect(screen.queryByText("권한 미리보기")).not.toBeInTheDocument()

    const tree = screen.getByRole("navigation", { name: "메뉴 계층" })
    const group = within(tree).getByRole("button", { name: "시스템 설정" })
    expect(group).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(group)
    expect(group).toHaveAttribute("aria-expanded", "false")
    expect(within(tree).queryByRole("button", { name: "공통코드 관리" })).not.toBeInTheDocument()

    fireEvent.click(group)
    fireEvent.click(within(tree).getByRole("button", { name: "공통코드 관리" }))
    expect(within(tree).getByRole("button", { name: "공통코드 관리" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("heading", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(document.getElementById("role-permission-common-code-view")).toBeInTheDocument()
    expect(document.getElementById("role-permission-user-view")).not.toBeInTheDocument()
  }, devSettings.mockDelayMs * 8 + 2500)
})
