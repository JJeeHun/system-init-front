// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { listAssignableMockRoles } from "@/features/role/api/role-management.mock"
import { roleQueryKeys } from "@/features/role/api/role-management.api"
import { RoleCombobox } from "@/features/role/components/RoleCombobox"

describe("RoleCombobox", () => {
  it("returns only assignable lower-level roles for the signed-in actor", () => {
    expect(listAssignableMockRoles("SYSTEM").map(role => role.id)).toEqual(["ADMIN", "MANAGER", "STAFF"])
    expect(listAssignableMockRoles("MANAGER").map(role => role.id)).toEqual(["STAFF"])
    expect(listAssignableMockRoles("STAFF")).toEqual([])
  })

  it("displays the role name for a selected role id", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(roleQueryKeys.assignable(), [
      { id: "ADMIN", name: "운영 최고 관리자", description: "", level: 300 },
      { id: "STAFF", name: "일반 사용자", description: "", level: 100 },
    ])
    render(
      <QueryClientProvider client={client}>
        <RoleCombobox value="STAFF" aria-label="역할 선택" />
      </QueryClientProvider>,
    )
    expect(screen.getByRole("combobox", { name: "역할 선택" })).toHaveValue("일반 사용자")
    client.clear()
  })
})
