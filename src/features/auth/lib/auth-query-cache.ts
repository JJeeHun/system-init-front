import type { QueryClient } from "@tanstack/react-query"

import { getAuthSessionToken, subscribeAuthSession } from "@/features/auth/storage/auth-session"

const AUTH_QUERY_ROOTS = new Set(["user", "navigation", "role", "filter"])

export function clearAuthQueryCache(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: ({ queryKey }) => typeof queryKey[0] === "string" && AUTH_QUERY_ROOTS.has(queryKey[0]),
  })
}

export function subscribeAuthQueryCache(queryClient: QueryClient) {
  return subscribeAuthSession(() => {
    if (getAuthSessionToken() === null) clearAuthQueryCache(queryClient)
  })
}
