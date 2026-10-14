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

export type NavigationPermissions = {
  isView: boolean
  isCreated: boolean
  isUpdated: boolean
  isDeleted: boolean
}

export type NavigationMenuItem = {
  id: string
  label: string
  labelKey?: string
  path?: string
  icon?: NavigationIconKey
  permissions?: NavigationPermissions
  children?: NavigationMenuItem[]
}
