import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { createMockRole, deleteMockRole, getMockRolePermissions, listMockRoles, saveMockRolePermissions, updateMockRole } from "@/features/role/api/role-management.mock"
import type { RoleInput, RolePermissions } from "@/features/role/types/role-management.types"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

export async function getRoles() {
  await waitForMockDelay()
  return listMockRoles()
}

export async function getRolePermissions(roleId: string) {
  await waitForMockDelay()
  return getMockRolePermissions(roleId)
}

export async function createRole(input: RoleInput) {
  await waitForMockDelay()
  return createMockRole(input)
}

export async function updateRole({ id, request }: { id: string; request: RoleInput }) {
  await waitForMockDelay()
  return updateMockRole(id, request)
}

export async function deleteRole(id: string) {
  await waitForMockDelay()
  deleteMockRole(id)
}

export async function saveRolePermissions(request: RolePermissions) {
  await waitForMockDelay()
  return saveMockRolePermissions(request)
}

export const roleQueryKeys = {
  all: ["role", "management"] as const,
  list: () => [...roleQueryKeys.all, "list"] as const,
  permissions: (roleId: string | null) => [...roleQueryKeys.all, "permissions", roleId] as const,
}

export const roleQueries = {
  list: () => queryOptions({ queryKey: roleQueryKeys.list(), queryFn: getRoles }),
  permissions: (roleId: string | null) => queryOptions({
    queryKey: roleQueryKeys.permissions(roleId),
    queryFn: () => getRolePermissions(roleId!),
    enabled: roleId !== null,
  }),
}

export const roleMutations = {
  create: () => mutationOptions({ mutationFn: createRole, meta: { globalError: true } }),
  update: () => mutationOptions({ mutationFn: updateRole, meta: { globalError: true } }),
  delete: () => mutationOptions({ mutationFn: deleteRole, meta: { globalError: true } }),
  permissions: () => mutationOptions({ mutationFn: saveRolePermissions, meta: { globalError: true } }),
}
