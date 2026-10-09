import { useRef } from "react"

// Blocks repeat mutation calls synchronously, before the loading state re-renders.
export function useMutationLock() {
  const locked = useRef(false)

  return (execute: () => Promise<unknown>) => {
    if (locked.current) return

    locked.current = true
    // Mutation errors remain available through React Query / its global handler.
    void execute().catch(() => undefined).finally(() => {
      locked.current = false
    })
  }
}
