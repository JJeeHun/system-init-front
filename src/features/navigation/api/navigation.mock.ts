import type { RoleAction, RoleMenuGrant } from "@/features/role/types/role-management.types"

import { AppError } from "@/shared/lib/app-error"
import type { MenuInput, MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

const initialMenus: MenuRecord[] = [
  { id: "system", parentId: null, label: "시스템 관리", labelKey: "navigation:menu.system", kind: "group", path: "", sortOrder: 10, enabled: true, scope: "GENERAL" },
  { id: "user-access", parentId: "system", label: "사용자·권한", labelKey: "navigation:menu.user-access", kind: "group", path: "", sortOrder: 10, enabled: true, scope: "GENERAL" },
  { id: "user", parentId: "user-access", label: "사용자 관리", labelKey: "navigation:menu.user", kind: "page", path: "/app/system/users", icon: "users", sortOrder: 10, enabled: true, scope: "GENERAL" },
  { id: "role", parentId: "user-access", label: "역할·권한 관리", labelKey: "navigation:menu.role", kind: "page", path: "/app/system/roles", icon: "settings", sortOrder: 20, enabled: true, scope: "GENERAL" },
  { id: "system-settings", parentId: "system", label: "시스템 설정", labelKey: "navigation:menu.system-settings", kind: "group", path: "", sortOrder: 20, enabled: true, scope: "GENERAL" },
  { id: "menu-management", parentId: "system-settings", label: "메뉴 관리", labelKey: "navigation:menu.menu-management", kind: "page", path: "/app/system/menus", icon: "settings", sortOrder: 10, enabled: true, scope: "SYSTEM" },
  { id: "common-code", parentId: "system-settings", label: "공통코드 관리", labelKey: "navigation:menu.common-code", kind: "page", path: "/app/master/common-code", icon: "code", sortOrder: 20, enabled: true, scope: "GENERAL" },
]

let records = initialMenus.map((menu) => ({ ...menu }))

export function getMenuRecordsSnapshot(): MenuRecord[] {
  return records.map((menu) => ({ ...menu }))
}

function byOrder(a: MenuRecord, b: MenuRecord) {
  return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)
}

const ALL_ACTIONS: RoleAction[] = ["view", "create", "edit", "delete"]

export function buildVisibleMenus(grants: readonly RoleMenuGrant[], isSystem = false): NavigationMenuItem[] {
  const actionsByMenu = new Map(grants.map(grant => [grant.menuId, grant.actions]))

  function nested(parentId: string | null): NavigationMenuItem[] {
    return records
      .filter(menu => menu.parentId === parentId && menu.enabled)
      .sort(byOrder)
      .flatMap(menu => {
        if (menu.kind === "group") {
          const children = nested(menu.id)
          return children.length ? [{
            id: menu.id, label: menu.label, labelKey: menu.labelKey, icon: menu.icon, children,
          }] : []
        }

        const permissions = actionsByMenu.get(menu.id) ?? (isSystem ? ALL_ACTIONS : [])
        if (!permissions.includes("view")) return []

        return [{
          id: menu.id,
          label: menu.label,
          labelKey: menu.labelKey,
          path: menu.path,
          icon: menu.icon,
          permissions: [...permissions],
        }]
      })
  }

  return nested(null)
}

function validateMenu(input: MenuInput, editingId?: string) {
  const id = input.id.trim()
  const label = input.label.trim()
  const path = input.path.trim()
  if (input.scope !== "SYSTEM" && input.scope !== "GENERAL") throw new AppError("MENU_INVALID_SCOPE", "Invalid menu management scope")
  const parent = input.parentId ? records.find((menu) => menu.id === input.parentId) : null

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new AppError("MENU_INVALID_ID", "Invalid menu ID")
  if (!label) throw new AppError("MENU_NAME_REQUIRED", "Menu name is required")
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) throw new AppError("MENU_INVALID_ORDER", "Invalid order")
  if (records.some((menu) => menu.id === id && menu.id !== editingId)) throw new AppError("MENU_DUPLICATE_ID", "Duplicate menu ID")
  if (parent && parent.kind !== "group") throw new AppError("MENU_INVALID_PARENT", "Parent must be a group")
  if (input.parentId && !parent) throw new AppError("MENU_INVALID_PARENT", "Parent does not exist")
  if (input.parentId === id) throw new AppError("MENU_CYCLE", "Circular menu hierarchy")
  if (input.kind === "page" && (!path.startsWith("/app/") || path.includes("?") || path.includes("#"))) throw new AppError("MENU_INVALID_PATH", "Invalid page path")
  if (input.kind === "group" && path) throw new AppError("MENU_INVALID_PATH", "Group cannot have a path")
  if (path && records.some((menu) => menu.id !== editingId && menu.path === path)) throw new AppError("MENU_DUPLICATE_PATH", "Duplicate path")
  if (editingId && input.parentId) {
    let cursor: MenuRecord | undefined = parent ?? undefined
    while (cursor) {
      if (cursor.id === editingId) throw new AppError("MENU_CYCLE", "Circular menu hierarchy")
      cursor = records.find((menu) => menu.id === cursor?.parentId)
    }
  }
  if (editingId && input.kind === "page" && records.some((menu) => menu.parentId === editingId)) {
    throw new AppError("MENU_HAS_CHILDREN", "Group has child menus")
  }
  return { ...input, id, label, path, parentId: input.parentId || null }
}

export function createMockMenu(input: MenuInput): MenuRecord {
  const created = validateMenu(input)
  records = [...records, created]
  return { ...created }
}

export function updateMockMenu(id: string, input: MenuInput): MenuRecord {
  const previous = records.find((menu) => menu.id === id)
  if (!previous) throw new AppError("MENU_NOT_FOUND", "Menu not found")
  if (input.id !== id) throw new AppError("MENU_INVALID_ID", "Menu ID is immutable")
  const updated = validateMenu(input, id)
  const stored: MenuRecord = {
    ...updated,
    // Built-in translations stay active until the original label is edited.
    labelKey: previous.label === updated.label ? previous.labelKey : undefined,
  }
  records = records.map((menu) => menu.id === id ? stored : menu)
  return { ...stored }
}

export function deleteMockMenu(id: string): void {
  if (!records.some((menu) => menu.id === id)) throw new AppError("MENU_NOT_FOUND", "Menu not found")
  if (records.some((menu) => menu.parentId === id)) throw new AppError("MENU_HAS_CHILDREN", "Group has child menus")
  records = records.filter((menu) => menu.id !== id)
}

export function resetMockMenusForTest() {
  records = initialMenus.map((menu) => ({ ...menu }))
}
