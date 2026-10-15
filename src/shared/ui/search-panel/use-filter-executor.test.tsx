// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useFilterExecutor } from "@/shared/ui/search-panel"

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16))
  vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("filter search executor", () => {
  const filter = vi.fn((items: readonly string[], keyword: string) =>
    items.filter(item => item.includes(keyword)))

  beforeEach(() => filter.mockClear())

  it("renders loading before filtering, blocks repeated execution, and reports completion", () => {
    const { result } = renderHook(() => useFilterExecutor(["alpha", "beta"], filter))
    expect(result.current.type).toBe("filter")
    expect(result.current.data).toEqual(["alpha", "beta"])

    act(() => {
      result.current.execute("a")
      result.current.execute("a")
    })
    expect(result.current.status).toBe("loading")
    expect(filter).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(32) })
    expect(filter).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(["alpha", "beta"])
    expect(result.current.status).toBe("loading")

    act(() => { vi.advanceTimersByTime(268) })
    expect(result.current.status).toBe("success")
    act(() => { result.current.execute("beta") })
    expect(filter).toHaveBeenCalledTimes(1)

    act(() => { vi.advanceTimersByTime(800) })
    expect(result.current.status).toBe("idle")
    act(() => { result.current.execute("beta") })
    expect(result.current.status).toBe("loading")
    act(() => { vi.advanceTimersByTime(32) })
    expect(result.current.data).toEqual(["beta"])
    expect(filter).toHaveBeenCalledTimes(2)
  })

  it("reapplies the previous search when source data changes without a new click", () => {
    const initial = ["alpha", "beta"]
    const updated = ["alpha", "beta", "alphabet"]
    const { result, rerender } = renderHook(
      ({ items }) => useFilterExecutor(items, filter),
      { initialProps: { items: initial } },
    )
    act(() => { result.current.execute("alpha") })
    act(() => { vi.advanceTimersByTime(32) })
    expect(result.current.data).toEqual(["alpha"])
    rerender({ items: updated })
    expect(result.current.data).toEqual(["alpha", "alphabet"])
  })

  it("resets an in-progress search and reports failures without replacing previous data", () => {
    const failingFilter = vi.fn((items: readonly string[], keyword: string) => {
      if (keyword === "error") throw new Error("filter failed")
      return items.filter(item => item.includes(keyword))
    })
    const { result } = renderHook(() => useFilterExecutor(["alpha", "beta"], failingFilter))
    act(() => { result.current.execute("alpha"); result.current.reset() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(failingFilter).not.toHaveBeenCalled()
    expect(result.current.status).toBe("idle")
    expect(result.current.data).toEqual(["alpha", "beta"])

    act(() => { result.current.execute("error") })
    act(() => { vi.advanceTimersByTime(32) })
    expect(result.current.status).toBe("error")
    expect(result.current.data).toEqual(["alpha", "beta"])

    act(() => { result.current.execute("beta") })
    act(() => { vi.advanceTimersByTime(32) })
    expect(result.current.data).toEqual(["beta"])
  })
})
