// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import type { FormEvent } from "react"
import { describe, expect, it, vi } from "vitest"

import { SearchPanel } from "@/shared/ui/search-panel"

describe("filter search feedback", () => {
  it("shows loading and completion without a status prop", async () => {
    let finish!: () => void
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return new Promise<void>(resolve => { finish = resolve })
    })
    render(
      <SearchPanel searchType="filter" onSearch={onSearch} onReset={vi.fn()}>
        Filters
      </SearchPanel>,
    )

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "검색 중..." })).toBeDisabled()

    await act(async () => { finish() })
    expect(screen.getByRole("button", { name: "조회 완료" })).toBeDisabled()
  })

  it("shows failure feedback and allows retry", async () => {
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return Promise.reject(new Error("filter failed"))
    })
    render(
      <SearchPanel searchType="filter" onSearch={onSearch} onReset={vi.fn()}>
        Filters
      </SearchPanel>,
    )

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(await screen.findByRole("button", { name: "조회 실패 · 다시 시도" })).toBeEnabled()
  })
})
