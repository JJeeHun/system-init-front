import { getMenuRecordsSnapshot } from "@/features/navigation/api/navigation.mock"
import { canCreateRole, canDelegateAction, canManageRole } from "@/features/role/lib/role-delegation"
import { AppError } from "@/shared/lib/app-error"
import type { RoleAction, RoleInput, RoleMenuGrant, RolePermissions, RoleRecord } from "@/features/role/types/role-management.types"

const ACTIONS: RoleAction[] = ["view", "create", "edit", "delete"]
const initialRoles: RoleRecord[] = [
  { id: "SYSTEM", name: "시스템 관리자", description: "개발·시스템 설정 관리", level: 1000 },
  { id: "ADMIN", name: "운영 최고 관리자", description: "전체 운영 권한", level: 300 },
  { id: "MANAGER", name: "실무 관리자", description: "위임된 업무 관리", level: 200 },
  { id: "STAFF", name: "일반 사용자", description: "일반 사용자용 기본 역할", level: 100 },
]
const initialPermissions: Record<string, RoleMenuGrant[]> = {
  SYSTEM: ["user", "role", "menu-management", "common-code"].map(menuId => ({ menuId, actions: [...ACTIONS] })),
  ADMIN: ["user", "role", "common-code"].map(menuId => ({ menuId, actions: [...ACTIONS] })),
  MANAGER: [{ menuId: "role", actions: ["view"] }, { menuId: "user", actions: ["view", "create", "edit"] }],
  STAFF: ["user", "common-code"].map(menuId => ({ menuId, actions: ["view"] })),
}

let roles = initialRoles.map(role => ({ ...role }))
let permissions: Record<string, RoleMenuGrant[]> = structuredClone(initialPermissions)

function findRole(roleId: string) {
  const role = roles.find(role => role.id === roleId)
  if (!role) throw new AppError("ROLE_NOT_FOUND", "Role not found")
  return role
}

function requireManager(actorRoleId: string, target: RoleRecord) {
  const actor = findRole(actorRoleId)
  if (!canManageRole(actor, target, permissions[actorRoleId] ?? [])) {
    throw new AppError("ROLE_MANAGEMENT_FORBIDDEN", "Cannot manage this role")
  }
  return actor
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
  return { id, name, description, level: editingId ? findRole(editingId).level : 100 }
}

export function listMockRoles(): RoleRecord[] {
  return roles.map(role => ({ ...role }))
}

export function listAssignableMockRoles(actorRoleId: string): RoleRecord[] {
  const actor = findRole(actorRoleId)
  const canEditUsers = (permissions[actorRoleId] ?? []).some(
    grant => grant.menuId === "user" && grant.actions.some(action => action === "create" || action === "edit"),
  )
  if (!canEditUsers) return []
  return roles.filter(role => role.level < actor.level).map(role => ({ ...role }))
}

export function createMockRole(input: RoleInput, actorRoleId = "SYSTEM"): RoleRecord {
  const actor = findRole(actorRoleId)
  if (!canCreateRole(actor, permissions[actorRoleId] ?? [])) {
    throw new AppError("ROLE_MANAGEMENT_FORBIDDEN", "Cannot create role")
  }
  const role = normalize(input)
  roles = [...roles, role]
  permissions[role.id] = []
  return { ...role }
}

export function updateMockRole(id: string, request: RoleInput, actorRoleId = "SYSTEM"): RoleRecord {
  requireManager(actorRoleId, findRole(id))
  if (request.id !== id) throw new AppError("ROLE_INVALID_ID", "Role code cannot be changed")
  const role = normalize(request, id)
  roles = roles.map(item => item.id === id ? role : item)
  return { ...role }
}

export function deleteMockRole(id: string, actorRoleId = "SYSTEM"): void {
  const target = findRole(id)
  // Fixed hierarchy roles cannot be deleted; SYSTEM and ADMIN are protected as well.
  if (["SYSTEM", "ADMIN", "MANAGER", "STAFF"].includes(id)) throw new AppError("ROLE_IN_USE", "Built-in role cannot be deleted")
  requireManager(actorRoleId, target)
  roles = roles.filter(role => role.id !== id)
  delete permissions[id]
}

export function getMockRolePermissions(roleId: string): RolePermissions {
  findRole(roleId)
  return { roleId, grants: structuredClone(permissions[roleId] ?? []) }
}

export function saveMockRolePermissions(request: RolePermissions, actorRoleId = "SYSTEM"): RolePermissions {
  const actor = requireManager(actorRoleId, findRole(request.roleId))
  const allMenus = new Map(getMenuRecordsSnapshot().map(menu => [menu.id, menu]))
  const previous = new Map((permissions[request.roleId] ?? []).map(grant => [grant.menuId, grant.actions]))
  const menuIds = new Set<string>()
  for (const grant of request.grants) {
    if (!grant.menuId.trim() || menuIds.has(grant.menuId) ||
      allMenus.get(grant.menuId)?.kind !== "page" ||
      new Set(grant.actions).size !== grant.actions.length ||
      grant.actions.some(action => !ACTIONS.includes(action)) ||
      (grant.actions.length > 0 && !grant.actions.includes("view"))) {
      throw new AppError("ROLE_INVALID_PERMISSION", "Invalid menu permission")
    }
    menuIds.add(grant.menuId)
  }
  // Compare individual action deltas: unchanged protected grants are retained,
  // but cannot be added or revoked by a lower administrator.
  const next = new Map(request.grants.map(grant => [grant.menuId, grant.actions]))
  for (const menuId of new Set([...previous.keys(), ...next.keys()])) {
    const menu = allMenus.get(menuId)
    const before = previous.get(menuId) ?? []
    const after = next.get(menuId) ?? []
    for (const action of ACTIONS) {
      if (before.includes(action) !== after.includes(action) &&
        (!menu || !canDelegateAction(actor, menu, action))) {
        throw new AppError("ROLE_DELEGATION_FORBIDDEN", "Permission is outside the delegated scope")
      }
    }
  }
  permissions[request.roleId] = structuredClone(request.grants.filter(grant => grant.actions.length > 0))
  return getMockRolePermissions(request.roleId)
}

export function resetMockRolesForTest() {
  roles = initialRoles.map(role => ({ ...role }))
  permissions = structuredClone(initialPermissions)
}
