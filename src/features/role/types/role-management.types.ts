export type RoleAction = "view" | "create" | "edit" | "delete"

export type RoleRecord = {
  id: string
  name: string
  description: string
}

export type RoleInput = RoleRecord

export type RoleMenuGrant = {
  menuId: string
  actions: RoleAction[]
}

export type RolePermissions = {
  roleId: string
  grants: RoleMenuGrant[]
}
