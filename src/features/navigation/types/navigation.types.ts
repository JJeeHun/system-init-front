import type { RoleAction } from "@/features/role/types/role-management.types"

export type NavigationIconKey =
  | "activity"
  | "boxes"
  | "calendar"
  | "clipboard"
  | "code"
  | "dashboard"
  | "package"
  | "receipt"
  | "scan"
  | "settings"
  | "truck"
  | "users"

export type NavigationMenuItem = {
  id: string
  label: string
  labelKey?: string
  path?: string
  icon?: NavigationIconKey
  permissions?: RoleAction[]
  children?: NavigationMenuItem[]
}
