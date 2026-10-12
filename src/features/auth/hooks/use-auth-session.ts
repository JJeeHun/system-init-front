import { useSyncExternalStore } from "react"

import { getAuthSessionToken, subscribeAuthSession } from "@/features/auth/storage/auth-session"

export function useAuthSessionToken() {
  return useSyncExternalStore(subscribeAuthSession, getAuthSessionToken, () => null)
}
