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
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="master/common-code" element={<p>공통코드 화면</p>} />
            <Route path="system/users" element={<p>사용자 관리 화면</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("main navigation shell", () => {
  it("uses home as the default screen and allows desktop sidebar collapse and restore", async () => {
    renderNavigation()
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument()

    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })
    const collapse = within(sidebar).getByRole("button", { name: "PC 사이드바 접기" })
    expect(collapse).toHaveAttribute("aria-expanded", "true")
    expect(within(sidebar).getByRole("link", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(within(sidebar).getByRole("navigation", { name: "시스템 관리 하위 메뉴" })).toBeInTheDocument()
    expect(within(screen.getAllByRole("banner")[0]).queryByRole("button", { name: "PC 사이드바 접기" })).not.toBeInTheDocument()
    expect(within(sidebar).queryByRole("link", { name: "홈" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/app")

    fireEvent.click(collapse)
    const expand = within(sidebar).getByRole("button", { name: "PC 사이드바 펼치기" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    expect(sidebar).toHaveAttribute("data-collapsed", "true")
    expect(within(sidebar).getByRole("link", { name: "공통코드 관리" })).toHaveAttribute("title", "공통코드 관리")

    fireEvent.click(expand)
    expect(screen.getByRole("button", { name: "PC 사이드바 접기" }))
      .toHaveAttribute("aria-expanded", "true")
    expect(sidebar).toHaveAttribute("data-collapsed", "false")
  })

  it("keeps the system category and collapsed rail when the logo returns home, while clearing the active page", async () => {
    renderNavigation()
    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })
    const header = screen.getByRole("banner")
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument()

    const system = within(header).getByRole("button", { name: "시스템 관리" })
    expect(system).toHaveAttribute("aria-pressed", "true")
    expect(within(sidebar).getByRole("link", { name: "사용자 관리" }))
      .not.toHaveAttribute("aria-current")

    fireEvent.click(within(sidebar).getByRole("link", { name: "사용자 관리" }))
    expect(await screen.findByText("사용자 관리 화면")).toBeInTheDocument()
    expect(within(sidebar).getByRole("link", { name: "사용자 관리" }))
      .toHaveAttribute("aria-current", "page")

    fireEvent.click(within(sidebar).getByRole("button", { name: "PC 사이드바 접기" }))
    expect(sidebar).toHaveAttribute("data-collapsed", "true")

    fireEvent.click(within(header).getByRole("link", { name: "홈으로 이동" }))
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument()
    expect(sidebar).toHaveAttribute("data-collapsed", "true")
    expect(system).toHaveAttribute("aria-pressed", "true")

    const sameMenu = within(sidebar).getByRole("link", { name: "사용자 관리" })
    expect(sameMenu).toHaveAttribute("title", "사용자 관리")
    expect(sameMenu).not.toHaveAttribute("aria-current")

    fireEvent.click(sameMenu)
    expect(await screen.findByText("사용자 관리 화면")).toBeInTheDocument()
    expect(sidebar).toHaveAttribute("data-collapsed", "true")
    fireEvent.click(within(sidebar).getByRole("button", { name: "PC 사이드바 펼치기" }))
    expect(sidebar).toHaveAttribute("data-collapsed", "false")
    expect(within(sidebar).getByRole("link", { name: "사용자 관리" }))
      .toHaveAttribute("aria-current", "page")
  })

  it("keeps the mobile sidebar open for category selection, closes for a page, and supports Escape", async () => {
    renderNavigation()

    const menuButton = screen.getByRole("button", { name: "사이드 메뉴 열기" })
    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute("aria-expanded", "true")
    fireEvent.keyDown(window, { key: "Escape" })
    expect(menuButton).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(menuButton)
    const mobileRoots = within(sidebar).getByRole("navigation", { name: "주요 업무 메뉴" })
    const master = await within(mobileRoots).findByRole("button", { name: "시스템 관리" })
    fireEvent.click(master)

    expect(menuButton).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument()
    fireEvent.click(within(sidebar).getByRole("link", { name: "공통코드 관리" }))
    await waitFor(() => expect(screen.getByText("공통코드 화면")).toBeInTheDocument())
    expect(menuButton).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(screen.getByRole("link", { name: "홈으로 이동" }))
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument()
  })
})
