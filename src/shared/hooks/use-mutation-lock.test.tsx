// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useMutationLock } from "@/shared/hooks/use-mutation-lock"

describe("useMutationLock", () => {
  it("blocks rapid duplicate calls until the first request completes", async () => {
    let complete!: () => void
    const pending = new Promise<void>((resolve) => { complete = resolve })
    const execute = vi.fn(() => pending)
    const { result } = renderHook(() => useMutationLock())

    act(() => {
      result.current(execute)
      result.current(execute)
      result.current(execute)
    })
    expect(execute).toHaveBeenCalledTimes(1)

    await act(async () => { complete(); await pending })
    // Wait for the lock's finally handler before the next call.
    await act(async () => { await Promise.resolve() })
    act(() => { result.current(execute) })
    expect(execute).toHaveBeenCalledTimes(2)
  })

  it("releases the lock after failed work so retry is possible", async () => {
    let reject!: (error: Error) => void
    const pending = new Promise<void>((_resolve, rejectPromise) => { reject = rejectPromise })
    const execute = vi.fn().mockImplementationOnce(() => pending).mockResolvedValue(undefined)
    const { result } = renderHook(() => useMutationLock())

    act(() => { result.current(execute); result.current(execute) })
    expect(execute).toHaveBeenCalledTimes(1)
    await act(async () => { reject(new Error("request failed")); await pending.catch(() => undefined) })
    await act(async () => { await Promise.resolve() })
    act(() => { result.current(execute) })
    expect(execute).toHaveBeenCalledTimes(2)
  })
})
