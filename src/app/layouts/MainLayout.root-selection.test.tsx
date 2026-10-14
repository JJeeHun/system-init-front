// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { AuthProvider } from "@/app/auth/AuthProvider"
import { MainLayout } from "@/app/layouts/MainLayout"
import { app } from "@/app/routing/route-metadata"

import { navigationQueryKeys } from "@/features/navigation/api/navigation.api"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { userQueryKeys } from "@/features/user/api/user.api"

vi.mock("@/app/routing/TabWorkspace", () => ({
  TabWorkspace: () => <div>Workspace</div>,
}))

function HistoryControls() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <>
      <output data-testid="pathname">{pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>Back</button>
      <button type="button" onClick={() => navigate(1)}>Forward</button>
    </>
  )
}

describe("MainLayout root selection without navigation store", () => {
  it("switches menu categories and derives the active root from the URL on back/forward", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
    const view = { isView: true, isCreated: false, isUpdated: false, isDeleted: false }
    const menus: NavigationMenuItem[] = [
      { id: "system", label: "System", children: [
        { id: "user", label: "Users", path: app.system.users.path, permissions: view },
      ] },
      { id: "catalog", label: "Catalog", children: [
        { id: "common-code", label: "Codes", path: app.master.commonCode.path, permissions: view },
      ] },
    ]
    client.setQueryData(navigationQueryKeys.menus(), menus)
    client.setQueryData(userQueryKeys.current(), {
      id: "staff", name: "Staff", roleId: "STAFF", roleName: "Staff", centerName: "Centre",
    })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[app.system.users.path]}>
          <AuthProvider>
            <HistoryControls />
            <Routes>
              <Route path="/app/*" element={<MainLayout />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const header = screen.getByRole("banner")
    expect(within(header).getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(within(header).getByRole("button", { name: "Catalog" }))
    const sidebar = screen.getByRole("complementary")
    fireEvent.click(within(sidebar).getByRole("link", { name: "Codes" }))
    await waitFor(() => expect(screen.getByTestId("pathname")).toHaveTextContent(app.master.commonCode.path))
    expect(within(header).getByRole("button", { name: "Catalog" })).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    await waitFor(() => expect(screen.getByTestId("pathname")).toHaveTextContent(app.system.users.path))
    await waitFor(() => expect(within(header).getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true"))

    fireEvent.click(screen.getByRole("button", { name: "Forward" }))
    await waitFor(() => expect(screen.getByTestId("pathname")).toHaveTextContent(app.master.commonCode.path))
    await waitFor(() => expect(within(header).getByRole("button", { name: "Catalog" })).toHaveAttribute("aria-pressed", "true"))
  })
})
