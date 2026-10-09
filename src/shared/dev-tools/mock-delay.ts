import { config } from "@/shared/config/config"
import { devSettings } from "@/shared/dev-tools/settings"

// Used only by mock API implementations. Real API clients must not depend on this.
export function waitForMockDelay(): Promise<void> {
  const ms = config.app.isProduction ? 0 : devSettings.mockDelayMs
  return ms > 0
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : Promise.resolve()
}
