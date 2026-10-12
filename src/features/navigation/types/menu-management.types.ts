import type { NavigationIconKey } from "@/features/navigation/types/navigation.types"

export type MenuScope = "SYSTEM" | "GENERAL"

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
  scope: MenuScope
}

export type MenuInput = Omit<MenuRecord, "labelKey">
