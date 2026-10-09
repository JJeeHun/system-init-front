import { afterEach, describe, expect, it, vi } from "vitest"

import { config } from "@/shared/config/config"
import { devSettings } from "@/shared/dev-tools/settings"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

afterEach(() => vi.useRealTimers())

describe("central mock delay settings", () => {
  it("uses a single 1-second delay for mock requests in non-production", async () => {
    expect(devSettings.mockDelayMs).toBe(1000)
    if (config.app.isProduction) return

    vi.useFakeTimers()
    let resolved = false
    const request = waitForMockDelay().then(() => { resolved = true })
    await vi.advanceTimersByTimeAsync(999)
    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await request
    expect(resolved).toBe(true)
  })
})
