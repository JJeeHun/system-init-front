// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { MainLayout } from "@/app/layouts/MainLayout"
import { HomePage } from "@/pages/HomePage"

function renderNavigation() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="master/common-code" element={<p>공통코드 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("navigation category selection", () => {
  it("shows the four planned system pages without navigating away when the header category is selected", async () => {
    renderNavigation()
    const header = screen.getByRole("banner")
    const system = await within(header).findByRole("button", { name: "시스템 관리" })
    fireEvent.click(system)

    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument()
    expect(system).toHaveAttribute("aria-pressed", "true")

    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })
    expect(within(sidebar).getByRole("link", { name: "사용자 관리" })).toBeInTheDocument()
    expect(within(sidebar).getByRole("link", { name: "역할·권한 관리" })).toBeInTheDocument()
    expect(within(sidebar).getByRole("link", { name: "메뉴 관리" })).toBeInTheDocument()
    expect(within(sidebar).getByRole("link", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(within(sidebar).queryByRole("link", { name: "품목관리" })).not.toBeInTheDocument()
  })

  it("keeps the mobile drawer open for a category and closes only after selecting a screen", async () => {
    renderNavigation()
    const open = screen.getByRole("button", { name: "사이드 메뉴 열기" })
    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })

    fireEvent.click(open)
    const mobileRoots = within(sidebar).getByRole("navigation", { name: "주요 업무 메뉴" })
    const master = await within(mobileRoots).findByRole("button", { name: "시스템 관리" })
    fireEvent.click(master)

    expect(open).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument()
    const commonCode = within(sidebar).getByRole("link", { name: "공통코드 관리" })
    fireEvent.click(commonCode)

    await waitFor(() => expect(screen.getByText("공통코드 화면")).toBeInTheDocument())
    expect(open).toHaveAttribute("aria-expanded", "false")
  })
})
