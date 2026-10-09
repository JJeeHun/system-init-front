import type { NavigationIconKey } from "@/features/navigation/types/navigation.types"

export type MenuRecord = {
  id: string
  parentId: string | null
  label: string
  labelKey?: string
  kind: "group" | "page"
  path: string
  icon?: NavigationIconKey
  sortOrder: number
  enabled: boolean
  permissionCode: string
}

export type MenuInput = Omit<MenuRecord, "labelKey">
