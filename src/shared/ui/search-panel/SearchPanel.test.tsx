// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SearchPanel } from "@/shared/ui/search-panel"

describe("common search panel", () => {
  it("renders custom fields and delegates search and reset to its consumer", () => {
    const onSearch = vi.fn(event => event.preventDefault())
    const onReset = vi.fn()
    const { container } = render(
      <SearchPanel onSearch={onSearch} onReset={onReset}>
        <label htmlFor="custom-filter">Custom filter</label>
        <input id="custom-filter" />
      </SearchPanel>,
    )
    expect(screen.getByLabelText("Custom filter")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(onSearch).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "초기화" }))
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(container.querySelector("form")).toBeInTheDocument()
  })

  it("disables search and reset when loading", () => {
    render(<SearchPanel onSearch={vi.fn()} onReset={vi.fn()} loading>Custom filters</SearchPanel>)
    expect(screen.getByRole("button", { name: "조회" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled()
  })
})
