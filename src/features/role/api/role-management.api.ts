import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { createMockRole, deleteMockRole, getMockRolePermissions, listAssignableMockRoles, listMockRoles, saveMockRolePermissions, updateMockRole } from "@/features/role/api/role-management.mock"
import type { RoleInput, RolePermissions } from "@/features/role/types/role-management.types"
import { getCurrentUser } from "@/features/user/api/user.api"
import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"

export async function getRoles() {
  await waitForMockDelay()
  return listMockRoles()
}

export async function getAssignableRoles() {
  const actor = await getCurrentUser()
  await waitForMockDelay()
  return listAssignableMockRoles(actor.roleId)
}

export async function getRolePermissions(roleId: string) {
  await waitForMockDelay()
  return getMockRolePermissions(roleId)
}

export async function createRole(input: RoleInput & { actorRoleId?: string }) {
  await waitForMockDelay()
  const { actorRoleId, ...role } = input
  return createMockRole(role, actorRoleId)
}

export async function updateRole({ id, request, actorRoleId }: { id: string; request: RoleInput; actorRoleId?: string }) {
  await waitForMockDelay()
  return updateMockRole(id, request, actorRoleId)
}

export async function deleteRole({ id, actorRoleId }: { id: string; actorRoleId?: string }) {
  await waitForMockDelay()
  deleteMockRole(id, actorRoleId)
}

export async function saveRolePermissions(request: RolePermissions & { actorRoleId?: string }) {
  await waitForMockDelay()
  const { actorRoleId, ...permissions } = request
  return saveMockRolePermissions(permissions, actorRoleId)
}

export const roleQueryKeys = {
  all: ["role", "management"] as const,
  list: () => [...roleQueryKeys.all, "list"] as const,
  assignable: () => [...roleQueryKeys.list(), "assignable"] as const,
  permissions: (roleId: string | null) => [...roleQueryKeys.all, "permissions", roleId] as const,
}

export const roleQueries = {
  list: () => queryOptions({ queryKey: roleQueryKeys.list(), queryFn: getRoles }),
  assignable: () => queryOptions({ queryKey: roleQueryKeys.assignable(), queryFn: getAssignableRoles }),
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
