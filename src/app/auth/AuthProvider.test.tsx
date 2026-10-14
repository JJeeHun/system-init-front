// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuthProvider, useAuth } from "@/app/auth/AuthProvider"
import { app } from "@/app/routing/route-metadata"
import { navigationQueryKeys } from "@/features/navigation/api/navigation.api"
import type { NavigationMenuItem, NavigationPermissions } from "@/features/navigation/types/navigation.types"
import { userQueryKeys } from "@/features/user/api/user.api"
import type { CurrentUser } from "@/features/user/types/user.types"

const user: CurrentUser = {
  id: "manager", name: "매니저", roleId: "MANAGER",
  roleName: "실무 관리자", centerName: "센터",
}

const fullPermissions: NavigationPermissions = {
  isView: true, isCreated: true, isUpdated: true, isDeleted: true,
}

function AuthProbe() {
  const { user: currentUser, allowedMenus, isLoading, isError, canAccessRoute, getMenuPermissions } = useAuth()

  return (
    <>
      <output data-testid="user">{currentUser?.id ?? "none"}</output>
      <output data-testid="menu-count">{allowedMenus.length}</output>
      <output data-testid="loading">{String(isLoading)}</output>
      <output data-testid="error">{String(isError)}</output>
      <output data-testid="home">{String(canAccessRoute(app.home.path))}</output>
      <output data-testid="users">{String(canAccessRoute(app.system.users.path))}</output>
      <output data-testid="menus">{String(canAccessRoute(app.system.menus.path))}</output>
      <output data-testid="unregistered">{String(canAccessRoute("/not-an-app-route"))}</output>
      <output data-testid="user-can-create">{String(getMenuPermissions("user")?.isCreated ?? false)}</output>
    </>
  )
}

function renderWithMenus(menus: NavigationMenuItem[]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  client.setQueryData(userQueryKeys.current(), user)
  client.setQueryData(navigationQueryKeys.menus(), menus)

  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe("authenticated route permissions", () => {
  it("exposes cached user and menu permissions without keeping another menu state", () => {
    renderWithMenus([{
      id: "system", label: "시스템", children: [
        { id: "user", label: "사용자", path: app.system.users.path, permissions: fullPermissions },
      ],
    }])

    expect(screen.getByTestId("user")).toHaveTextContent("manager")
    expect(screen.getByTestId("menu-count")).toHaveTextContent("1")
    expect(screen.getByTestId("loading")).toHaveTextContent("false")
    expect(screen.getByTestId("error")).toHaveTextContent("false")
    expect(screen.getByTestId("home")).toHaveTextContent("true")
    expect(screen.getByTestId("users")).toHaveTextContent("true")
    expect(screen.getByTestId("menus")).toHaveTextContent("false")
    expect(screen.getByTestId("unregistered")).toHaveTextContent("false")
    expect(screen.getByTestId("user-can-create")).toHaveTextContent("true")
  })

  it("denies access when the menu is missing or view permission is false", () => {
    renderWithMenus([{
      id: "user", label: "사용자", path: app.system.users.path,
      permissions: { ...fullPermissions, isView: false },
    }])

    expect(screen.getByTestId("users")).toHaveTextContent("false")
    expect(screen.getByTestId("menus")).toHaveTextContent("false")
    expect(screen.getByTestId("home")).toHaveTextContent("true")
  })
})
