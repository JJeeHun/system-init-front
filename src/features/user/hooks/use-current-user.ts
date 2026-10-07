import { useQuery } from "@tanstack/react-query"

import { userQueries } from "@/features/user/api/user.api"

export function useCurrentUser() {
  return useQuery(userQueries.current())
}
