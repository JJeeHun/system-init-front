import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { createMockUser, listMockUsers, setMockUserEnabled, updateMockUser } from "@/features/user/api/user-management.mock"
import type { UserAccountInput, UserFilters } from "@/features/user/types/user-management.types"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

export const userManagementQueryKeys = {
  all: ["user", "management"] as const,
  list: (filters: UserFilters) => [...userManagementQueryKeys.all, "list", filters] as const,
}

export async function getUserAccounts(filters: UserFilters) {
  await waitForMockDelay()
  return listMockUsers(filters)
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
  list: (filters: UserFilters) => queryOptions({
    queryKey: userManagementQueryKeys.list(filters),
    queryFn: () => getUserAccounts(filters),
  }),
}

export const userManagementMutations = {
  create: () => mutationOptions({ mutationFn: createUserAccount, meta: { globalError: true } }),
  update: () => mutationOptions({ mutationFn: updateUserAccount, meta: { globalError: true } }),
  changeEnabled: () => mutationOptions({ mutationFn: changeUserEnabled, meta: { globalError: true } }),
}
