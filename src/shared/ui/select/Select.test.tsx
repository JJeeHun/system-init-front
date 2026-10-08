// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Select } from "@/shared/ui/select"

const options = [
  { value: "enabled", label: "사용" },
  { value: "disabled", label: "미사용" },
]

describe("Select", () => {
  it("presents the placeholder before a choice is made", () => {
    render(<Select options={options} placeholder="상태 선택" aria-label="상태" />)

    expect(screen.getByRole("combobox", { name: "상태" })).toHaveTextContent("상태 선택")
  })

  it("disables user selection when disabled", () => {
    render(<Select options={options} disabled aria-label="상태" />)

    expect(screen.getByRole("combobox", { name: "상태" })).toBeDisabled()
  })
})
