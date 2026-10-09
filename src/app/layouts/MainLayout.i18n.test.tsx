// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { MainLayout } from "@/app/layouts/MainLayout"
import { CommonCodePage } from "@/pages/CommonCodePage"
import { HomePage } from "@/pages/HomePage"
import { i18n } from "@/shared/i18n"

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

afterEach(async () => {
  await act(async () => { await i18n.changeLanguage("ko") })
})

describe("feature-based translations in the existing admin screens", () => {
  it("translates navigation and common-code validation, including errors already visible during a language change", async () => {
    await act(async () => { await i18n.changeLanguage("ko") })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <Routes>
            <Route path="/app" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="master/common-code" element={<CommonCodePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const sidebar = await screen.findByRole("complementary", { name: "사이드 메뉴" })
    expect(await within(sidebar).findByRole("link", { name: "공통코드" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "영어로 변경" }))
    expect(await screen.findByRole("heading", { name: "Home" })).toBeInTheDocument()
    const commonCodes = within(sidebar).getByRole("link", { name: "Common Codes" })
    fireEvent.click(commonCodes)
    expect(await screen.findByRole("heading", { name: "Common Code Management" })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole("button", { name: "Add Group" }))
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("Please enter a group code.")).toBeInTheDocument()

    // The modal makes the header inaccessible; emulate an external locale change while the form is open.
    await act(async () => { await i18n.changeLanguage("ko") })
    await waitFor(() => expect(screen.getByText("그룹 코드를 입력해주세요.")).toBeInTheDocument())
    expect(screen.getByRole("dialog", { name: "그룹 등록" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "취소" }))
    expect(await screen.findByRole("heading", { name: "공통코드 관리" })).toBeInTheDocument()
    expect(within(sidebar).getByRole("link", { name: "공통코드" })).toBeInTheDocument()
  })
})
