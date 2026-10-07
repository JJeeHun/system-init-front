export type CommonCodeGroup = {
  id: string
  code: string
  name: string
  description: string
  enabled: boolean
  sortOrder: number
}

export type CommonCodeItem = {
  id: string
  groupId: string
  code: string
  name: string
  description: string
  enabled: boolean
  sortOrder: number
}

export type CommonCodeResponse = {
  groups: CommonCodeGroup[]
  items: CommonCodeItem[]
}

export type CreateCommonCodeGroupRequest = Omit<CommonCodeGroup, "id">

export type UpdateCommonCodeGroupRequest = Omit<
  CreateCommonCodeGroupRequest,
  "code"
>

export type CreateCommonCodeItemRequest = Omit<CommonCodeItem, "id">

export type UpdateCommonCodeItemRequest = Omit<
  CreateCommonCodeItemRequest,
  "groupId" | "code"
>

export type CommonCodeGroupFormValues = CreateCommonCodeGroupRequest

export type CommonCodeItemFormValues = Omit<
  CreateCommonCodeItemRequest,
  "groupId"
>
