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

describe("role permissions tree search", () => {
  it("filters by path, preserves permission editor, and restores the collapsed hierarchy", async () => {
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

    await waitFor(() => expect(document.getElementById("role-permission-user-view")).toBeInTheDocument(), {
      timeout: devSettings.mockDelayMs * 5 + 2000,
    })
    const tree = screen.getByRole("navigation", { name: "메뉴 계층" })
    const search = within(tree).getByRole("searchbox", { name: "메뉴 검색" })
    const group = within(tree).getByRole("button", { name: "시스템 설정" })
    fireEvent.click(group)
    expect(group).toHaveAttribute("aria-expanded", "false")

    fireEvent.change(search, { target: { value: "/app/master/common-code" } })
    expect(within(tree).getByRole("button", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(within(tree).getByRole("button", { name: "시스템 설정" })).toHaveAttribute("aria-expanded", "true")
    expect(document.getElementById("role-permission-user-view")).toBeInTheDocument()

    fireEvent.change(search, { target: { value: "no-menu-match" } })
    expect(within(tree).getByRole("status")).toHaveTextContent("검색된 메뉴가 없습니다.")
    expect(document.getElementById("role-permission-user-view")).toBeInTheDocument()

    fireEvent.click(within(tree).getByRole("button", { name: "검색어 초기화" }))
    expect(within(tree).getByRole("button", { name: "시스템 설정" })).toHaveAttribute("aria-expanded", "false")
    expect(within(tree).queryByRole("button", { name: "공통코드 관리" })).not.toBeInTheDocument()
  }, devSettings.mockDelayMs * 8 + 2500)
})
