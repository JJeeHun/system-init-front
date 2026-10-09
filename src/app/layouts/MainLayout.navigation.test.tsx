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
    const collapse = screen.getByRole("button", { name: "PC 사이드바 접기" })
    expect(collapse).toHaveAttribute("aria-expanded", "true")
    expect(within(sidebar).getByRole("link", { name: "홈" })).toHaveAttribute("href", "/app")

    fireEvent.click(collapse)
    const expand = screen.getByRole("button", { name: "PC 사이드바 펼치기" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    expect(sidebar).toHaveClass("lg:hidden")

    fireEvent.click(expand)
    expect(screen.getByRole("button", { name: "PC 사이드바 접기" }))
      .toHaveAttribute("aria-expanded", "true")
    expect(sidebar).not.toHaveClass("lg:hidden")
  })

  it("closes the mobile sidebar after selection and with Escape", async () => {
    renderNavigation()

    const menuButton = screen.getByRole("button", { name: "사이드 메뉴 열기" })
    const sidebar = screen.getByRole("complementary", { name: "사이드 메뉴" })

    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute("aria-expanded", "true")
    fireEvent.keyDown(window, { key: "Escape" })
    expect(menuButton).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(menuButton)
    const mobileRoots = within(sidebar).getByRole("navigation", { name: "주요 업무 메뉴" })
    const master = await within(mobileRoots).findByRole("link", { name: "기준정보" })
    fireEvent.click(master)

    await waitFor(() => expect(screen.getByText("공통코드 화면")).toBeInTheDocument())
    expect(menuButton).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(within(sidebar).getByRole("link", { name: "홈" }))
    expect(await screen.findByRole("heading", { name: "홈" })).toBeInTheDocument()
  })
})
