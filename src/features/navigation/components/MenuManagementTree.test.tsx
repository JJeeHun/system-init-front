// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
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
  resetMockMenusForTest()
  await act(async () => { await changeLanguage("ko") })
})

const mockUiWait = { timeout: devSettings.mockDelayMs * 3 + 1000 }

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app/system/menus"]}>
        <Routes>
          <Route path="/app/system/menus" element={<MenuManagementPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("menu management tree navigation", () => {
  it("collapses and expands hierarchy and shows the selected full menu path", async () => {
    renderPage()
    const tree = screen.getByRole("heading", { name: "메뉴 구조" }).closest("section")!
    expect(await within(tree).findByRole("button", { name: "사용자 관리" }, mockUiWait)).toBeInTheDocument()

    const collapse = within(tree).getByRole("button", { name: "사용자·권한 접기" })
    expect(collapse).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(collapse)
    expect(within(tree).queryByRole("button", { name: "사용자 관리" })).not.toBeInTheDocument()
    const expand = within(tree).getByRole("button", { name: "사용자·권한 펼치기" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(expand)

    fireEvent.click(within(tree).getByRole("button", { name: "사용자 관리" }))
    expect(screen.getByText("시스템 관리 / 사용자·권한 / 사용자 관리")).toBeInTheDocument()
  }, devSettings.mockDelayMs * 6 + 2000)

  it("searches by menu ID, path and group name while retaining ancestors", async () => {
    renderPage()
    const tree = screen.getByRole("heading", { name: "메뉴 구조" }).closest("section")!
    const search = within(tree).getByRole("searchbox", { name: "메뉴 검색" })
    await within(tree).findByRole("button", { name: "공통코드 관리" }, mockUiWait)

    fireEvent.change(search, { target: { value: "common-code" } })
    expect(within(tree).getByRole("button", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(within(tree).getByRole("button", { name: "시스템 설정" })).toBeInTheDocument()
    expect(within(tree).queryByRole("button", { name: "사용자 관리" })).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: "/app/system/roles" } })
    expect(within(tree).getByRole("button", { name: "역할·권한 관리" })).toBeInTheDocument()
    expect(within(tree).getByRole("button", { name: "사용자·권한" })).toBeInTheDocument()
    expect(within(tree).queryByRole("button", { name: "공통코드 관리" })).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: "사용자·권한" } })
    expect(within(tree).getByRole("button", { name: "사용자 관리" })).toBeInTheDocument()
    expect(within(tree).getByRole("button", { name: "역할·권한 관리" })).toBeInTheDocument()

    fireEvent.change(search, { target: { value: "missing-menu" } })
    expect(within(tree).getByRole("status")).toHaveTextContent("검색된 메뉴가 없습니다.")
    fireEvent.click(within(tree).getByRole("button", { name: "검색어 초기화" }))
    expect(within(tree).getByRole("button", { name: "공통코드 관리" })).toBeInTheDocument()
  }, devSettings.mockDelayMs * 6 + 2000)

  it("temporarily expands searched groups without changing saved collapse state", async () => {
    renderPage()
    const tree = screen.getByRole("heading", { name: "메뉴 구조" }).closest("section")!
    const search = within(tree).getByRole("searchbox", { name: "메뉴 검색" })
    await within(tree).findByRole("button", { name: "메뉴 관리" }, mockUiWait)
    fireEvent.click(within(tree).getByRole("button", { name: "시스템 설정 접기" }))
    expect(within(tree).queryByRole("button", { name: "메뉴 관리" })).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: "menu-management" } })
    expect(within(tree).getByRole("button", { name: "메뉴 관리" })).toBeInTheDocument()
    expect(within(tree).getByRole("button", { name: "시스템 설정 접기" })).toBeDisabled()
    fireEvent.click(within(tree).getByRole("button", { name: "검색어 초기화" }))
    expect(within(tree).getByRole("button", { name: "시스템 설정 펼치기" })).toHaveAttribute("aria-expanded", "false")
    expect(within(tree).queryByRole("button", { name: "메뉴 관리" })).not.toBeInTheDocument()
  }, devSettings.mockDelayMs * 6 + 2000)
})
