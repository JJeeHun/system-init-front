import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { createMockUser, ensureDemoMockUsers, listMockUsers, listMockUsersPage, setMockUserEnabled, updateMockUser } from "@/features/user/api/user-management.mock"
import type { UserAccountInput, UserFilters, UserListParams } from "@/features/user/types/user-management.types"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

export const userManagementQueryKeys = {
  all: ["user", "management"] as const,
  lists: () => [...userManagementQueryKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userManagementQueryKeys.lists(), params] as const,
}

export async function getUserAccounts(filters: UserFilters) {
  await waitForMockDelay()
  return listMockUsers(filters)
}

export async function getPagedUserAccounts(params: UserListParams) {
  await waitForMockDelay()
  ensureDemoMockUsers()
  return listMockUsersPage(params)
}

export async function createUserAccount(input: UserAccountInput) {
  await waitForMockDelay()
  return createMockUser(input)
}

export async function updateUserAccount({ id, request }: { id: string; request: Omit<UserAccountInput, "id"> }) {
  await waitForMockDelay()
  return updateMockUser(id, request)
}

export async function changeUserEnabled({ id, enabled }: { id: string; enabled: boolean }) {
  await waitForMockDelay()
  return setMockUserEnabled(id, enabled)
}

export const userManagementQueries = {
  list: (params: UserListParams) => queryOptions({
    queryKey: userManagementQueryKeys.list(params),
    queryFn: () => getPagedUserAccounts(params),
  }),
}

export const userManagementMutations = {
  create: () => mutationOptions({ mutationFn: createUserAccount, meta: { globalError: true } }),
  update: () => mutationOptions({ mutationFn: updateUserAccount, meta: { globalError: true } }),
  changeEnabled: () => mutationOptions({ mutationFn: changeUserEnabled, meta: { globalError: true } }),
}
