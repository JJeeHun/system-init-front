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
  children?: NavigationMenuItem[]
}
