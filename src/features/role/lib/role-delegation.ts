import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { RoleAction, RoleMenuGrant, RoleRecord } from "@/features/role/types/role-management.types"

export type RoleManagePolicy = {
  maxTargetLevel: number
  grantablePermissions: "ALL" | "GENERAL" | Partial<Record<string, RoleAction[]>>
}

// Managing another role requires role:edit; delegation is an independent limit.
const POLICIES: Record<string, RoleManagePolicy> = {
  SYSTEM: { maxTargetLevel: 999, grantablePermissions: "ALL" },
  ADMIN: { maxTargetLevel: 200, grantablePermissions: "GENERAL" },
  MANAGER: { maxTargetLevel: 100, grantablePermissions: {
    user: ["view", "create", "edit"],
    "common-code": ["view"],
  } },
}

export function canManageRole(actor: RoleRecord | null, target: RoleRecord, actorGrants: RoleMenuGrant[]) {
  if (!actor || actor.id === target.id) return false
  const policy = POLICIES[actor.id]
  if (!policy || actor.level <= target.level || target.level > policy.maxTargetLevel) return false
  return actor.id === "SYSTEM" || actorGrants.some(grant =>
    grant.menuId === "role" && grant.actions.includes("edit"))
}

export function canCreateRole(actor: RoleRecord | null, actorGrants: RoleMenuGrant[]) {
  return !!actor && actor.level > 100 && (
    actor.id === "SYSTEM" ||
    (!!POLICIES[actor.id] && actorGrants.some(grant =>
      grant.menuId === "role" && grant.actions.includes("edit")))
  )
}

export function canDelegateAction(actor: RoleRecord | null, menu: MenuRecord, action: RoleAction) {
  if (!actor || menu.kind !== "page") return false
  const rule = POLICIES[actor.id]?.grantablePermissions
  if (!rule) return false
  if (rule === "ALL") return true
  if (menu.scope === "SYSTEM") return false
  if (rule === "GENERAL") return true
  return rule[menu.id]?.includes(action) ?? false
}
