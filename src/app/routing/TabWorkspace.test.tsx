// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useLocation, useNavigate, MemoryRouter } from "react-router-dom"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "@/app/auth/AuthProvider"
import { TabWorkspace } from "@/app/routing/TabWorkspace"
import { app } from "@/app/routing/route-metadata"
import { navigationQueryKeys } from "@/features/navigation/api/navigation.api"
import type { NavigationMenuItem, NavigationPermissions } from "@/features/navigation/types/navigation.types"
import { userQueryKeys } from "@/features/user/api/user.api"

vi.mock("@/app/navigation/navigation-settings", () => ({
  navigationSettings: { tabsEnabled: true, maxOpenTabs: 2 },
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
vi.mock("@/pages/UserManagementPage", () => ({
  UserManagementPage: () => <input aria-label="User draft" defaultValue="" />,
}))
vi.mock("@/pages/RoleManagementPage", () => ({
  RoleManagementPage: () => <input aria-label="Role draft" defaultValue="" />,
}))
vi.mock("@/pages/MenuManagementPage", () => ({
  MenuManagementPage: () => <p>Menu management mounted</p>,
}))
vi.mock("@/pages/CommonCodePage", () => ({
  CommonCodePage: () => <p>Common code mounted</p>,
}))
vi.mock("@/pages/HomePage", () => ({ HomePage: () => <p>Home mounted</p> }))
vi.mock("@/pages/ForbiddenPage", () => ({ ForbiddenPage: () => <p>Forbidden mounted</p> }))
vi.mock("@/pages/MenuPage", () => ({ MenuPage: () => <p>Not found mounted</p> }))
vi.mock("@/pages/UiPlaygroundPage", () => ({ UiPlaygroundPage: () => <p>Playground mounted</p> }))

const permissions: NavigationPermissions = {
  isView: true, isCreated: true, isUpdated: true, isDeleted: true,
}

function permittedMenus(): NavigationMenuItem[] {
  return [{
    id: "system", label: "System", children: [
      { id: "user", label: "Users", path: app.system.users.path, permissions },
      { id: "role", label: "Roles", path: app.system.roles.path, permissions },
      { id: "menu-management", label: "Menus", path: app.system.menus.path, permissions },
    ],
  }]
}

function Controls() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <>
      <output data-testid="location">{pathname}</output>
      <button onClick={() => navigate(app.system.users.path)}>Users</button>
      <button onClick={() => navigate(app.system.roles.path)}>Roles</button>
      <button onClick={() => navigate(app.system.menus.path)}>Menus</button>
    </>
  )
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(userQueryKeys.current(), {
    id: "manager", name: "Manager", roleId: "MANAGER", roleName: "Manager", centerName: "Centre",
  })
  client.setQueryData(navigationQueryKeys.menus(), permittedMenus())

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[app.system.users.path]}>
        <AuthProvider>
          <Controls />
          <TabWorkspace />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

afterEach(() => vi.clearAllMocks())

describe("tab workspace permission lifecycle", () => {
  it("blocks the next tab at the configured limit, restores the previous URL and preserves existing input", async () => {
    setup()
    const userDraft = screen.getByRole("textbox", { name: "User draft" })
    fireEvent.change(userDraft, { target: { value: "unsaved" } })
    fireEvent.click(screen.getByRole("button", { name: "Roles" }))
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(app.system.roles.path))

    fireEvent.click(screen.getByRole("button", { name: "Menus" }))
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(app.system.roles.path))
    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Menu management mounted")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Users" }))
    expect(screen.getByRole("textbox", { name: "User draft" })).toHaveValue("unsaved")
  })

  it("unmounts a revoked tab and routes to an allowed screen", async () => {
    const client = setup()
    client.setQueryData(navigationQueryKeys.menus(), [])

    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(app.home.path))
    expect(screen.queryByRole("textbox", { name: "User draft" })).not.toBeInTheDocument()
    expect(await screen.findByText("Home mounted")).toBeInTheDocument()
  })

  it("remounts only the tab whose action permissions changed", async () => {
    const client = setup()
    const userDraft = screen.getByRole("textbox", { name: "User draft" })
    fireEvent.change(userDraft, { target: { value: "keep user input" } })

    fireEvent.click(screen.getByRole("button", { name: "Roles" }))
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(app.system.roles.path))
    const roleDraft = screen.getByRole("textbox", { name: "Role draft" })
    fireEvent.change(roleDraft, { target: { value: "reset role input" } })

    const next = permittedMenus()
    const role = next[0].children?.find((menu) => menu.id === "role")
    if (!role) throw new Error("Missing role fixture")
    role.permissions = { ...permissions, isUpdated: false }
    client.setQueryData(navigationQueryKeys.menus(), next)

    await waitFor(() => expect(screen.getByRole("textbox", { name: "Role draft" })).toHaveValue(""))
    fireEvent.click(screen.getByRole("button", { name: "Users" }))
    expect(screen.getByRole("textbox", { name: "User draft" })).toHaveValue("keep user input")
  })
})
