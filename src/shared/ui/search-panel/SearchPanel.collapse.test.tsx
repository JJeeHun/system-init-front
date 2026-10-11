// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { changeLanguage } from "@/shared/i18n"
import { SearchPanel } from "@/shared/ui/search-panel"

afterEach(async () => {
  await act(async () => { await changeLanguage("ko") })
})

describe("common search panel collapse", () => {
  it("collapses only the filter body and preserves input values and search behavior", () => {
    const onSearch = vi.fn(event => event.preventDefault())
    const { container } = render(
      <SearchPanel onSearch={onSearch} onReset={vi.fn()}>
        <label htmlFor="search-value">Keyword</label>
        <input id="search-value" defaultValue="retained" />
      </SearchPanel>,
    )

    const input = screen.getByLabelText("Keyword")
    const collapse = screen.getByRole("button", { name: "접기" })
    expect(collapse).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(collapse)

    expect(input).not.toBeVisible()
    expect(container.querySelector("form")).toBeInTheDocument()
    const expand = screen.getByRole("button", { name: "펼치기" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(expand)

    expect(input).toBeVisible()
    expect(input).toHaveValue("retained")
    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it("controls collapse independently per search panel", () => {
    const { container } = render(
      <>
        <SearchPanel onSearch={vi.fn()} onReset={vi.fn()}><input aria-label="First filter" /></SearchPanel>
        <SearchPanel onSearch={vi.fn()} onReset={vi.fn()}><input aria-label="Second filter" /></SearchPanel>
      </>,
    )
    const [first] = screen.getAllByRole("button", { name: "접기" })
    fireEvent.click(first)
    expect(screen.getByLabelText("First filter")).not.toBeVisible()
    expect(screen.getByLabelText("Second filter")).toBeVisible()
    expect(container.querySelectorAll("form")).toHaveLength(2)
  })
})
