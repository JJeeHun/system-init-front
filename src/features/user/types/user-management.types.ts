export type UserRoleCode = "ADMIN" | "STAFF"
export type UserCenterCode = "SEOUL" | "BUSAN"

export type UserAccount = {
  id: string
  name: string
  email: string
  center: UserCenterCode
  role: UserRoleCode
  enabled: boolean
}

export type UserAccountInput = UserAccount

export type UserFilters = {
  keyword: string
  status: "all" | "enabled" | "disabled"
  role: "all" | UserRoleCode
}
