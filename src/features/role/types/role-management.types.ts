export type RoleAction = "view" | "create" | "edit" | "delete"

export type RoleRecord = {
  id: string
  name: string
  description: string
  level: number
}

export type RoleInput = Omit<RoleRecord, "level">

export type RoleMenuGrant = {
  menuId: string
  actions: RoleAction[]
}

export type RolePermissions = {
  roleId: string
  grants: RoleMenuGrant[]
}
