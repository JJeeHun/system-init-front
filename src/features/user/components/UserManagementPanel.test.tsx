// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { MainLayout } from "@/app/layouts/MainLayout"
import { UserManagementPage } from "@/pages/UserManagementPage"
import { resetMockUsersForTest } from "@/features/user/api/user-management.mock"
import { changeLanguage } from "@/shared/i18n"
import { devSettings } from "@/shared/dev-tools/settings"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(async () => {
  resetMockUsersForTest()
  await act(async () => { await changeLanguage("ko") })
})

describe("user management page", () => {
  it("opens from its route and creates a user through the dialog", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/app/system/users"]}>
          <Routes>
            <Route path="/app" element={<MainLayout />}>
              <Route path="system/users" element={<UserManagementPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    const time = { timeout: devSettings.mockDelayMs * 3 + 1500 }
    expect(await screen.findByRole("heading", { level: 1, name: "사용자 관리" }, time)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "검색 조건" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "사용자 등록" }))
    const editor = screen.getByRole("dialog", { name: "사용자 등록" })
    fireEvent.change(within(editor).getByRole("textbox", { name: /로그인 아이디/ }), { target: { value: "newuser" } })
    fireEvent.change(within(editor).getByRole("textbox", { name: /사용자명/ }), { target: { value: "새 사용자" } })
    fireEvent.change(within(editor).getByRole("textbox", { name: /이메일/ }), { target: { value: "newuser@example.com" } })
    fireEvent.click(within(editor).getByRole("button", { name: "저장" }))

    expect(await screen.findByText("조회 결과 6건", undefined, { timeout: devSettings.mockDelayMs * 3 + 1500 })).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "사용자 등록" })).not.toBeInTheDocument()
  }, devSettings.mockDelayMs * 7 + 2000)
})
