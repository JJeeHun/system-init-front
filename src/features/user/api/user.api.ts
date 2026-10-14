import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"
import { queryOptions } from "@tanstack/react-query"

import type { CurrentUser } from "@/features/user/types/user.types"
import { getAuthSession } from "@/features/auth/storage/auth-session"


const mockCurrentUser: CurrentUser = {
  id: "admin",
  name: "관리자",
  roleId: "SYSTEM",
  roleName: "시스템 관리자",
  centerName: "서울물류센터",
}

const mockUsers: Record<string, CurrentUser> = {
  admin: mockCurrentUser,
  manager: { id: "manager", name: "실무 관리자", roleId: "MANAGER", roleName: "실무 관리자", centerName: "서울물류센터" },
  staff: { id: "staff", name: "일반 사용자", roleId: "STAFF", roleName: "일반 사용자", centerName: "서울물류센터" },
}

export async function getCurrentUser(): Promise<CurrentUser> {
  await waitForMockDelay()
  const username = getAuthSession()?.mockUsername ?? "admin"
  return mockUsers[username] ?? { ...mockUsers.staff, id: username, name: username }
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
