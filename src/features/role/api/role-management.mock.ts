import { AppError } from "@/shared/lib/app-error"
import type { RoleAction, RoleInput, RoleMenuGrant, RolePermissions, RoleRecord } from "@/features/role/types/role-management.types"

const ACTIONS: RoleAction[] = ["view", "create", "edit", "delete"]
const initialRoles: RoleRecord[] = [
  { id: "ADMIN", name: "관리자", description: "관리자용 기본 역할" },
  { id: "STAFF", name: "일반 사용자", description: "일반 사용자용 기본 역할" },
]
const initialPermissions: Record<string, RoleMenuGrant[]> = {
  ADMIN: ["user", "role", "menu-management", "common-code"].map(menuId => ({ menuId, actions: [...ACTIONS] })),
  STAFF: ["user", "common-code"].map(menuId => ({ menuId, actions: ["view"] })),
}

let roles = initialRoles.map(role => ({ ...role }))
let permissions: Record<string, RoleMenuGrant[]> = structuredClone(initialPermissions)

function findRole(roleId: string) {
  if (!roles.some(role => role.id === roleId)) throw new AppError("ROLE_NOT_FOUND", "Role not found")
}

function normalize(input: RoleInput, editingId?: string): RoleRecord {
  const id = input.id.trim()
  const name = input.name.trim()
  const description = input.description.trim()
  if (!/^[A-Z][A-Z0-9_]{1,29}$/.test(id)) throw new AppError("ROLE_INVALID_ID", "Invalid role code")
  if (!name) throw new AppError("ROLE_NAME_REQUIRED", "Role name is required")
  if (roles.some(role => role.id.toLowerCase() === id.toLowerCase() && role.id !== editingId)) {
    throw new AppError("ROLE_DUPLICATE_ID", "Role code already exists")
  }
  return { id, name, description }
}

export function listMockRoles(): RoleRecord[] {
  return roles.map(role => ({ ...role }))
}

export function createMockRole(input: RoleInput): RoleRecord {
  const role = normalize(input)
  roles = [...roles, role]
  permissions[role.id] = []
  return { ...role }
}

export function updateMockRole(id: string, request: RoleInput): RoleRecord {
  findRole(id)
  if (request.id !== id) throw new AppError("ROLE_INVALID_ID", "Role code cannot be changed")
  const role = normalize(request, id)
  roles = roles.map(item => item.id === id ? role : item)
  return { ...role }
}

export function deleteMockRole(id: string): void {
  findRole(id)
  // ADMIN and STAFF are assigned in the existing user Mock. Their removal is unsafe.
  if (id === "ADMIN" || id === "STAFF") throw new AppError("ROLE_IN_USE", "Role is assigned to users")
  roles = roles.filter(role => role.id !== id)
  delete permissions[id]
}

export function getMockRolePermissions(roleId: string): RolePermissions {
  findRole(roleId)
  return { roleId, grants: structuredClone(permissions[roleId] ?? []) }
}

export function saveMockRolePermissions(request: RolePermissions): RolePermissions {
  findRole(request.roleId)
  const menuIds = new Set<string>()
  for (const grant of request.grants) {
    if (!grant.menuId.trim() || menuIds.has(grant.menuId) ||
      new Set(grant.actions).size !== grant.actions.length ||
      grant.actions.some(action => !ACTIONS.includes(action)) ||
      (grant.actions.length > 0 && !grant.actions.includes("view"))) {
      throw new AppError("ROLE_INVALID_PERMISSION", "Invalid menu permission")
    }
    menuIds.add(grant.menuId)
  }
  permissions[request.roleId] = structuredClone(request.grants.filter(grant => grant.actions.length > 0))
  return getMockRolePermissions(request.roleId)
}

export function resetMockRolesForTest() {
  roles = initialRoles.map(role => ({ ...role }))
  permissions = structuredClone(initialPermissions)
}
