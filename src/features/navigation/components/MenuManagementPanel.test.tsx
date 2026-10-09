// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { MainLayout } from "@/app/layouts/MainLayout"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { changeLanguage } from "@/shared/i18n"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(async () => {
  resetMockMenusForTest()
  await act(async () => { await changeLanguage("ko") })
})

describe("menu management screen", () => {
  it("opens from the system menu, edits a label and reflects it in the sidebar", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={["/app/system/menus"]}>
          <Routes>
            <Route path="/app" element={<MainLayout />}>
              <Route path="system/menus" element={<MenuManagementPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole("heading", { level: 1, name: "메뉴 관리" })).toBeInTheDocument()
    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })
    expect(within(sidebar).getByRole("link", { name: "메뉴 관리" })).toHaveAttribute("aria-current", "page")

    const tree = screen.getByRole("heading", { name: "메뉴 구조" }).closest("section")!
    fireEvent.click(await within(tree).findByRole("button", { name: "사용자 관리" }))
    fireEvent.click(screen.getByRole("button", { name: "수정" }))
    const formDialog = screen.getByRole("dialog", { name: "메뉴 수정" })
    fireEvent.change(within(formDialog).getByRole("textbox", { name: /메뉴명/ }), { target: { value: "사용자 관리 변경" } })
    fireEvent.click(within(formDialog).getByRole("button", { name: "저장" }))

    expect(await within(sidebar).findByRole("link", { name: "사용자 관리 변경" })).toBeInTheDocument()
    expect(screen.queryByRole("dialog", { name: "메뉴 수정" })).not.toBeInTheDocument()
  })
})
