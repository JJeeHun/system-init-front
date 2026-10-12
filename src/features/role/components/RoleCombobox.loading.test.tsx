// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { RoleCombobox } from "@/features/role/components/RoleCombobox"

vi.mock("@/features/role/hooks/use-role-options", () => ({
  useRoleOptions: () => ({ options: [], isLoading: true, isError: false }),
}))

describe("RoleCombobox loading", () => {
  it("keeps loading feedback inside the combobox without adding a text row", () => {
    render(<RoleCombobox aria-label="역할 선택" />)

    expect(screen.getByRole("combobox", { name: "역할 선택" })).toBeDisabled()
    expect(screen.getByRole("status", { name: "데이터를 불러오는 중" })).toBeInTheDocument()
    expect(screen.queryByText("데이터를 불러오는 중")).not.toBeInTheDocument()
  })
})
