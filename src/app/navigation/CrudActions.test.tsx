// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"

import { CrudActions } from "@/app/navigation/CrudActions"
import { useNavigationStore } from "@/app/navigation/use-navigation-store"
import { setAuthSession, clearAuthSession } from "@/features/auth/storage/auth-session"
import { config } from "@/shared/config/config"

vi.mock("@/shared/dev-tools/mock-delay", () => ({ waitForMockDelay: async () => {} }))

function renderActions(username: string, permissions: { isView: boolean; isCreated: boolean; isUpdated: boolean; isDeleted: boolean },
  overrides: Record<string, unknown> = {}) {
  setAuthSession("mock-access-token", 3600, username)
  useNavigationStore.getState().updateMenuQuery({
    data: [{ id: "system", label: "시스템 관리", children: [
      { id: "user", label: "사용자 관리", path: "/app/system/users", permissions },
    ] }],
    isPending: false,
    isError: false,
  })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onCreate = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <QueryClientProvider client={client}>
      <CrudActions menuId="user" onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} {...overrides} />
    </QueryClientProvider>,
  )
  return { onCreate, onEdit, onDelete }
}

afterEach(() => {
  act(() => { clearAuthSession(); useNavigationStore.getState().resetNavigation() })
})

const viewOnly = { isView: true, isCreated: false, isUpdated: false, isDeleted: false }

describe("CRUD action permissions", () => {
  it("hides controls without granted permission for staff", async () => {
    renderActions("staff", viewOnly)
    await screen.findByText("사용자 관리").catch(() => null)
    await waitFor(() => expect(screen.queryByRole("button", { name: "등록" })).not.toBeInTheDocument())
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument()
  })

  it("shows only permitted actions for manager and respects show/disabled", async () => {
    const actions = renderActions("manager", { isView: true, isCreated: true, isUpdated: true, isDeleted: false },
      { showEdit: true, editDisabled: true, showCreate: true })
    const create = await screen.findByRole("button", { name: "등록" })
    const edit = screen.getByRole("button", { name: "수정" })
    expect(edit).toBeDisabled()
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument()
    fireEvent.click(create)
    expect(actions.onCreate).toHaveBeenCalledOnce()
    fireEvent.click(edit)
    expect(actions.onEdit).not.toHaveBeenCalled()
  })

  it("allows SYSTEM in a non-production build but still obeys show/disabled", async () => {
    expect(config.app.canBypassCrudPermissions("SYSTEM")).toBe(!config.app.isProduction)
    expect(config.app.canBypassCrudPermissions("MANAGER")).toBe(false)
    renderActions("admin", viewOnly, { showCreate: false, editDisabled: true })
    const edit = await screen.findByRole("button", { name: "수정" })
    expect(screen.queryByRole("button", { name: "등록" })).not.toBeInTheDocument()
    expect(edit).toBeDisabled()
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument()
  })
})
