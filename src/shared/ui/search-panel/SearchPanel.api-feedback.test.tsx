// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { FormEvent } from "react"
import { describe, expect, it, vi } from "vitest"

import { SearchPanel } from "@/shared/ui/search-panel"

describe("API search button feedback", () => {
  it("blocks repeated clicks and Enter submissions until completion feedback expires", async () => {
    let finish!: () => void
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return new Promise<void>(resolve => { finish = resolve })
    })
    const { container } = render(
      <SearchPanel onSearch={onSearch} onReset={vi.fn()}>Filters</SearchPanel>,
    )
    const form = container.querySelector("form")!

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(screen.getByRole("button", { name: "조회 중..." })).toBeDisabled()
    fireEvent.submit(form)
    expect(onSearch).toHaveBeenCalledTimes(1)

    await act(async () => { finish() })
    expect(screen.getByRole("button", { name: "조회 완료" })).toBeDisabled()
    fireEvent.submit(form)
    expect(onSearch).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(screen.getByRole("button", { name: "조회" })).toBeEnabled(), { timeout: 2000 })
    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(onSearch).toHaveBeenCalledTimes(2)
  })

  it("shows completion for an immediately resolved API search", async () => {
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return Promise.resolve()
    })
    render(<SearchPanel onSearch={onSearch} onReset={vi.fn()}>Filters</SearchPanel>)

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    await act(async () => { await Promise.resolve() })
    expect(screen.getByRole("button", { name: "조회 완료" })).toBeDisabled()
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it("allows retry when the API search rejects", async () => {
    const onSearch = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      return Promise.reject(new Error("request failed"))
    })
    render(<SearchPanel onSearch={onSearch} onReset={vi.fn()}>Filters</SearchPanel>)

    fireEvent.click(screen.getByRole("button", { name: "조회" }))
    expect(await screen.findByRole("button", { name: "조회 실패 · 다시 시도" })).toBeEnabled()
  })
})
