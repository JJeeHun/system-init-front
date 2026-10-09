import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"
import { queryOptions } from "@tanstack/react-query"

import type { CurrentUser } from "@/features/user/types/user.types"


const mockCurrentUser: CurrentUser = {
  id: "admin",
  name: "관리자",
  roleName: "운영 담당",
  centerName: "서울물류센터",
}

export async function getCurrentUser(): Promise<CurrentUser> {
  await waitForMockDelay()
  return mockCurrentUser
}

export const userQueryKeys = {
  all: ["user"] as const,
  current: () => [...userQueryKeys.all, "current"] as const,
}

export const userQueries = {
  current: () =>
    queryOptions({
      queryKey: userQueryKeys.current(),
      queryFn: getCurrentUser,
    }),
}
