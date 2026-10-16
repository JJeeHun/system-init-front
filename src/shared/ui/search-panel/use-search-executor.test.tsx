// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"

import { useSearchExecutor } from "@/shared/ui/search-panel"

describe("search executor", () => {
  function createWrapper() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return ({ children }: { children: ReactNode }) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }

  it("caches results by feature key and search criteria", async () => {
    const callback = vi.fn((value: string) => ["alpha", "beta"].filter(item => item.includes(value)))
    const { result } = renderHook(() => useSearchExecutor({
      queryKey: ["role", "management", 1],
      queryFn: callback,
      minLoadingMs: 0,
    }), { wrapper: createWrapper() })

    expect(result.current.type).toBe("filter")
    expect(result.current.data).toBeUndefined()

    await act(async () => { await result.current.execute("alpha") })
    expect(result.current.data).toEqual(["alpha"])
    expect(callback).toHaveBeenCalledTimes(1)

    await act(async () => { await result.current.execute("alpha") })
    expect(callback).toHaveBeenCalledTimes(1)

    await act(async () => { await result.current.execute("beta") })
    expect(result.current.data).toEqual(["beta"])
    expect(callback).toHaveBeenCalledTimes(2)

    await act(async () => { await result.current.execute("alpha") })
    expect(result.current.data).toEqual(["alpha"])
    expect(callback).toHaveBeenCalledTimes(2)

    act(() => { result.current.reset() })
    expect(result.current.data).toBeUndefined()
  })

  it("recomputes the active filter if the source version changes", async () => {
    const callback = vi.fn((value: string) => [value])
    const { result, rerender } = renderHook(
      ({ version }) => useSearchExecutor({
        queryKey: ["role", version],
        queryFn: callback,
        minLoadingMs: 0,
      }),
      { initialProps: { version: 1 }, wrapper: createWrapper() },
    )
    await act(async () => { await result.current.execute("alpha") })
    expect(callback).toHaveBeenCalledTimes(1)

    rerender({ version: 2 })
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(2))
    expect(result.current.data).toEqual(["alpha"])
  })
})
