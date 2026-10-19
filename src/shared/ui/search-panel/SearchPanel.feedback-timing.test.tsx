// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { FormEvent } from "react"
import { describe, expect, it, vi } from "vitest"

import { SearchPanel } from "@/shared/ui/search-panel"

describe("search panel completion feedback timing", () => {
  it("shows completion for an immediate cached result and prevents repeat submissions until reset", async () => {
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return Promise.resolve()
    })
    const onReset = vi.fn()

    const view = (loading: boolean) => (
      <SearchPanel searchType="filter" loading={loading} onSearch={onSearch} onReset={onReset}>
        Filters
      </SearchPanel>
    )
    const { rerender } = render(view(false))

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(screen.getByRole("button", { name: "검색 중..." })).toBeDisabled()
    await act(async () => { await Promise.resolve() })

    expect(screen.getByRole("button", { name: "조회 완료" })).toBeDisabled()
    rerender(view(true))
    expect(screen.getByRole("button", { name: "조회 완료" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "조회 완료" }))
    expect(onSearch).toHaveBeenCalledTimes(1)

    rerender(view(false))
    await waitFor(() => expect(screen.getByRole("button", { name: "조회" })).toBeEnabled(), { timeout: 2000 })
    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(onSearch).toHaveBeenCalledTimes(2)
  })
})
