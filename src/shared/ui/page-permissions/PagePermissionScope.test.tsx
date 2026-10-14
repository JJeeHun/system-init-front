// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { createPortal } from "react-dom"
import { describe, expect, it, vi } from "vitest"

import { config } from "@/shared/config/config"
import { CrudActions } from "@/shared/ui/crud-actions"
import { PagePermissionScope, usePageActionPermission } from "@/shared/ui/page-permissions"
import { SearchPanel } from "@/shared/ui/search-panel"

const viewOnly = { isView: true, isCreated: false, isUpdated: false, isDeleted: false }

function Actions({ onEdit }: { onEdit: () => void }) {
  const canEdit = usePageActionPermission("edit")
  return (
    <>
      <CrudActions onEdit={onEdit} onCreate={vi.fn()} onDelete={vi.fn()} />
      {createPortal(
        <button type="button" disabled={!canEdit} onClick={onEdit}>Portal edit</button>,
        document.body,
      )}
    </>
  )
}

describe("per-page action permissions", () => {
  it("keeps simultaneously mounted page permissions independent, including portals", () => {
    const userEdit = vi.fn()
    const roleEdit = vi.fn()
    render(
      <>
        <PagePermissionScope menuId="user" permissions={{ ...viewOnly, isUpdated: true }} bypassCrudPermissions={false}>
          <section aria-label="Users">
            <Actions onEdit={userEdit} />
          </section>
        </PagePermissionScope>
        <PagePermissionScope menuId="role" permissions={viewOnly} bypassCrudPermissions={false}>
          <section aria-label="Roles">
            <Actions onEdit={roleEdit} />
          </section>
        </PagePermissionScope>
      </>,
    )
    const [enabledEdit, disabledEdit] = screen.getAllByRole("button", { name: "Portal edit" })
    expect(enabledEdit).toBeEnabled()
    expect(disabledEdit).toBeDisabled()
    expect(screen.getAllByRole("button", { name: "수정" })).toHaveLength(1)
    expect(screen.queryByRole("button", { name: "등록" })).not.toBeInTheDocument()
    fireEvent.click(enabledEdit)
    fireEvent.click(disabledEdit)
    expect(userEdit).toHaveBeenCalledTimes(1)
    expect(roleEdit).not.toHaveBeenCalled()
  })

  it("blocks search by click and Enter submit without view permission", () => {
    const onSearch = vi.fn(event => event.preventDefault())
    const onReset = vi.fn()
    const { container } = render(
      <PagePermissionScope menuId="user" permissions={{ ...viewOnly, isView: false }} bypassCrudPermissions={false}>
        <SearchPanel onSearch={onSearch} onReset={onReset}><input aria-label="Keyword" /></SearchPanel>
      </PagePermissionScope>,
    )
    expect(screen.getByRole("button", { name: "조회" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled()
    const form = container.querySelector("form")
    if (!form) throw new Error("Search form missing")
    fireEvent.submit(form)
    expect(onSearch).not.toHaveBeenCalled()
    expect(onReset).not.toHaveBeenCalled()
  })

  it("preserves view permission while applying nonproduction SYSTEM CRUD bypass only", () => {
    const onCreate = vi.fn()
    const { rerender } = render(
      <PagePermissionScope menuId="user" permissions={viewOnly} bypassCrudPermissions={config.app.canBypassCrudPermissions("SYSTEM")}>
        <CrudActions onCreate={onCreate} />
      </PagePermissionScope>,
    )
    const create = screen.queryByRole("button", { name: "등록" })
    if (config.app.isProduction) expect(create).not.toBeInTheDocument()
    else {
      expect(create).toBeInTheDocument()
      fireEvent.click(create!)
      expect(onCreate).toHaveBeenCalledTimes(1)
    }
    rerender(
      <PagePermissionScope menuId="user" permissions={viewOnly} bypassCrudPermissions={config.app.canBypassCrudPermissions("MANAGER")}>
        <CrudActions onCreate={onCreate} />
      </PagePermissionScope>,
    )
    expect(screen.queryByRole("button", { name: "등록" })).not.toBeInTheDocument()
  })
})
