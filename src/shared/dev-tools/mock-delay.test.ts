import { afterEach, describe, expect, it, vi } from "vitest"

import { config } from "@/shared/config/config"
import { devSettings } from "@/shared/dev-tools/settings"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

afterEach(() => vi.useRealTimers())

describe("central mock delay settings", () => {
  it("uses the centrally configured delay for mock requests in non-production", async () => {
    expect(devSettings.mockDelayMs).toBeGreaterThan(0)
    if (config.app.isProduction) return

    vi.useFakeTimers()
    let resolved = false
    const request = waitForMockDelay().then(() => { resolved = true })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs - 1)
    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await request
    expect(resolved).toBe(true)
  })
})
