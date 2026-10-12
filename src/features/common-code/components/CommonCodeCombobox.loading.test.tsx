// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CommonCodeCombobox } from "@/features/common-code/components/CommonCodeCombobox"
import { CommonCodeGroupCode } from "@/features/common-code/constants/common-code-group"

vi.mock("@/features/common-code/hooks/use-common-code-options", () => ({
  useCommonCodeOptions: () => ({
    options: [], isLoading: true, isError: false, isGroupUnavailable: false,
  }),
}))

describe("CommonCodeCombobox loading", () => {
  it("keeps loading feedback inside the combobox without adding a text row", () => {
    render(<CommonCodeCombobox groupCode={CommonCodeGroupCode.YES_NO} aria-label="공통코드 선택" />)

    expect(screen.getByRole("combobox", { name: "공통코드 선택" })).toBeDisabled()
    expect(screen.getByRole("status", { name: "데이터를 불러오는 중" })).toBeInTheDocument()
    expect(screen.queryByText("데이터를 불러오는 중")).not.toBeInTheDocument()
  })
})
