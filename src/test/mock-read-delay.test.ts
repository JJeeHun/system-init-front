import { afterEach, describe, expect, it, vi } from "vitest"

import { getNavigationMenus } from "@/features/navigation/api/navigation.api"
import { getCurrentUser } from "@/features/user/api/user.api"
import {
  getCommonCodeGroups,
  getCommonCodeItems,
} from "@/features/common-code/api/common-code.api"

const mockReads: [string, () => Promise<unknown>][] = [
  ["navigation menus", getNavigationMenus],
  ["current user", getCurrentUser],
  ["common-code groups", getCommonCodeGroups],
  ["common-code details", () => getCommonCodeItems("group-1")],
]

afterEach(() => {
  vi.useRealTimers()
})

describe("Mock API read latency for loading-state inspection", () => {
  it.each(mockReads)("%s does not resolve before 1 second", async (_name, read) => {
    vi.useFakeTimers()
    const onResolved = vi.fn()
    const result = read().then(onResolved)

    await vi.advanceTimersByTimeAsync(999)
    expect(onResolved).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    await result
    expect(onResolved).toHaveBeenCalledOnce()
  })
})
