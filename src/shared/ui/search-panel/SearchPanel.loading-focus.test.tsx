// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SearchPanel } from "@/shared/ui/search-panel"

describe("search panel loading focus", () => {
  const view = (loading: boolean) => (
    <>
      <SearchPanel loading={loading} onSearch={vi.fn()} onReset={vi.fn()}>
        <input aria-label="Keyword" defaultValue="retained" />
        <input aria-label="Other filter" />
      </SearchPanel>
      <button type="button">Outside action</button>
    </>
  )

  it("keeps actions visible and restores the previously focused field after loading", () => {
    const { rerender } = render(view(false))
    const input = screen.getByLabelText("Keyword")
    act(() => input.focus())
    expect(input).toHaveFocus()

    rerender(view(true))
    expect(screen.getByRole("button", { name: "초기화" })).toBeVisible()
    expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "조회" })).toBeVisible()
    expect(screen.getByRole("button", { name: "조회" })).toBeDisabled()

    // jsdom does not implement native inert focus removal.
    act(() => input.blur())
    expect(input).not.toHaveFocus()

    rerender(view(false))
    expect(screen.getByLabelText("Keyword")).toHaveFocus()
    expect(input).toHaveValue("retained")
    expect(screen.getByRole("button", { name: "조회" })).toBeEnabled()
  })

  it("does not reclaim focus when the user has moved outside the panel", () => {
    const { rerender } = render(view(false))
    const input = screen.getByLabelText("Other filter")
    const outside = screen.getByRole("button", { name: "Outside action" })
    act(() => input.focus())
    rerender(view(true))
    act(() => outside.focus())
    expect(outside).toHaveFocus()

    rerender(view(false))
    expect(outside).toHaveFocus()
  })

  it("restores the previously focused reset button when it becomes enabled", () => {
    const { rerender } = render(view(false))
    const reset = screen.getByRole("button", { name: "초기화" })
    act(() => reset.focus())
    rerender(view(true))
    expect(reset).toBeDisabled()
    act(() => reset.blur())

    rerender(view(false))
    expect(reset).toBeEnabled()
    expect(reset).toHaveFocus()
  })
})
