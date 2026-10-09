import { mutationOptions, queryOptions, skipToken } from "@tanstack/react-query"
import { AppError } from "@/shared/lib/app-error"

import type {
  CommonCodeGroup,
  CommonCodeItem,
  CreateCommonCodeGroupRequest,
  CreateCommonCodeItemRequest,
  UpdateCommonCodeGroupRequest,
  UpdateCommonCodeItemRequest,
} from "@/features/common-code/types/common-code.types"

const READ_DELAY = 1000
const MUTATION_DELAY = 240

let groupSequence = 4
let itemSequence = 9

let mockGroups: CommonCodeGroup[] = [
  {
    id: "group-1",
    code: "USE_YN",
    name: "사용 여부",
    description: "공통 사용 여부 코드",
    enabled: true,
    sortOrder: 10,
  },
  {
    id: "group-2",
    code: "INBOUND_STATUS",
    name: "입고 상태",
    description: "입고 진행 상태",
    enabled: true,
    sortOrder: 20,
  },
  {
    id: "group-3",
    code: "INVENTORY_STATUS",
    name: "재고 상태",
    description: "재고 가용 상태",
    enabled: true,
    sortOrder: 30,
  },
]

let mockItems: CommonCodeItem[] = [
  {
    id: "item-1",
    groupId: "group-1",
    code: "Y",
    name: "사용",
    description: "",
    enabled: true,
    sortOrder: 10,
  },
  {
    id: "item-2",
    groupId: "group-1",
    code: "N",
    name: "미사용",
    description: "",
    enabled: true,
    sortOrder: 20,
  },
  {
    id: "item-3",
    groupId: "group-2",
    code: "PLANNED",
    name: "입고예정",
    description: "입고 작업 전 상태",
    enabled: true,
    sortOrder: 10,
  },
  {
    id: "item-4",
    groupId: "group-2",
    code: "RECEIVING",
    name: "입고중",
    description: "입고 작업 진행 상태",
    enabled: true,
    sortOrder: 20,
  },
  {
    id: "item-5",
    groupId: "group-2",
    code: "COMPLETED",
    name: "입고완료",
    description: "입고 처리가 완료된 상태",
    enabled: true,
    sortOrder: 30,
  },
  {
    id: "item-6",
    groupId: "group-3",
    code: "AVAILABLE",
    name: "가용",
    description: "출고 가능한 재고",
    enabled: true,
    sortOrder: 10,
  },
  {
    id: "item-7",
    groupId: "group-3",
    code: "ALLOCATED",
    name: "할당",
    description: "출고 작업에 할당된 재고",
    enabled: true,
    sortOrder: 20,
  },
  {
    id: "item-8",
    groupId: "group-3",
    code: "HOLD",
    name: "보류",
    description: "사용이 보류된 재고",
    enabled: true,
    sortOrder: 30,
  },
]

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cloneGroup(group: CommonCodeGroup): CommonCodeGroup {
  return { ...group }
}

function cloneItem(item: CommonCodeItem): CommonCodeItem {
  return { ...item }
}

function requireText(value: string, code: string, message: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new AppError(code, message)
  }

  return normalized
}

export async function getCommonCodeGroups(): Promise<CommonCodeGroup[]> {
  await wait(READ_DELAY)
  return mockGroups.map(cloneGroup)
}

export async function getCommonCodeItems(groupId: string): Promise<CommonCodeItem[]> {
  await wait(READ_DELAY)
  return mockItems.filter((item) => item.groupId === groupId).map(cloneItem)
}

export async function createCommonCodeGroup(
  request: CreateCommonCodeGroupRequest,
): Promise<CommonCodeGroup> {
  await wait(MUTATION_DELAY)

  const code = requireText(request.code, "COMMON_CODE_GROUP_CODE_REQUIRED", "그룹 코드를 입력해주세요.")
  const name = requireText(request.name, "COMMON_CODE_GROUP_NAME_REQUIRED", "그룹명을 입력해주세요.")

  if (mockGroups.some((group) => group.code === code)) {
    throw new AppError("COMMON_CODE_GROUP_DUPLICATE", "이미 등록된 그룹 코드입니다.")
  }

  const created: CommonCodeGroup = {
    ...request,
    id: "group-" + groupSequence++,
    code,
    name,
    description: request.description.trim(),
  }

  mockGroups = [...mockGroups, created]

  return cloneGroup(created)
}

export async function updateCommonCodeGroup(input: {
  id: string
  request: UpdateCommonCodeGroupRequest
}): Promise<CommonCodeGroup> {
  await wait(MUTATION_DELAY)

  const group = mockGroups.find((item) => item.id === input.id)

  if (!group) {
    throw new AppError("COMMON_CODE_GROUP_NOT_FOUND", "공통코드 그룹을 찾을 수 없습니다.")
  }

  const updated: CommonCodeGroup = {
    ...group,
    ...input.request,
    name: requireText(input.request.name, "COMMON_CODE_GROUP_NAME_REQUIRED", "그룹명을 입력해주세요."),
    description: input.request.description.trim(),
  }

  mockGroups = mockGroups.map((item) => (item.id === input.id ? updated : item))

  return cloneGroup(updated)
}

export async function deleteCommonCodeGroup(id: string): Promise<void> {
  await wait(MUTATION_DELAY)

  if (mockItems.some((item) => item.groupId === id)) {
    throw new AppError("COMMON_CODE_GROUP_HAS_ITEMS", "하위 코드가 있는 그룹은 삭제할 수 없습니다.")
  }

  mockGroups = mockGroups.filter((group) => group.id !== id)
}

export async function createCommonCodeItem(
  request: CreateCommonCodeItemRequest,
): Promise<CommonCodeItem> {
  await wait(MUTATION_DELAY)

  if (!mockGroups.some((group) => group.id === request.groupId)) {
    throw new AppError("COMMON_CODE_ITEM_GROUP_NOT_FOUND", "공통코드 그룹을 찾을 수 없습니다.")
  }

  const code = requireText(request.code, "COMMON_CODE_ITEM_CODE_REQUIRED", "코드를 입력해주세요.")
  const name = requireText(request.name, "COMMON_CODE_ITEM_NAME_REQUIRED", "코드명을 입력해주세요.")

  if (
    mockItems.some(
      (item) => item.groupId === request.groupId && item.code === code,
    )
  ) {
    throw new AppError("COMMON_CODE_ITEM_DUPLICATE", "선택한 그룹에 이미 등록된 코드입니다.")
  }

  const created: CommonCodeItem = {
    ...request,
    id: "item-" + itemSequence++,
    code,
    name,
    description: request.description.trim(),
  }

  mockItems = [...mockItems, created]

  return cloneItem(created)
}

export async function updateCommonCodeItem(input: {
  id: string
  request: UpdateCommonCodeItemRequest
}): Promise<CommonCodeItem> {
  await wait(MUTATION_DELAY)

  const item = mockItems.find((current) => current.id === input.id)

  if (!item) {
    throw new AppError("COMMON_CODE_ITEM_NOT_FOUND", "공통코드를 찾을 수 없습니다.")
  }

  const updated: CommonCodeItem = {
    ...item,
    ...input.request,
    name: requireText(input.request.name, "COMMON_CODE_ITEM_NAME_REQUIRED", "코드명을 입력해주세요."),
    description: input.request.description.trim(),
  }

  mockItems = mockItems.map((current) =>
    current.id === input.id ? updated : current,
  )

  return cloneItem(updated)
}

export async function deleteCommonCodeItem(id: string): Promise<void> {
  await wait(MUTATION_DELAY)
  mockItems = mockItems.filter((item) => item.id !== id)
}

export const commonCodeQueryKeys = {
  groups: ["common-code", "groups"] as const,
  items: (groupId: string | null) => ["common-code", "items", groupId] as const,
}

export const commonCodeQueries = {
  groups: () =>
    queryOptions({
      queryKey: commonCodeQueryKeys.groups,
      queryFn: getCommonCodeGroups,
      staleTime: 30 * 1000,
    }),
  items: (groupId: string | null) =>
    queryOptions({
      queryKey: commonCodeQueryKeys.items(groupId),
      queryFn: groupId ? () => getCommonCodeItems(groupId) : skipToken,
      staleTime: 30 * 1000,
    }),
}

export const commonCodeMutations = {
  createGroup: () =>
    mutationOptions({
      mutationFn: createCommonCodeGroup,
      meta: { globalError: true },
    }),

  updateGroup: () =>
    mutationOptions({
      mutationFn: updateCommonCodeGroup,
      meta: { globalError: true },
    }),

  deleteGroup: () =>
    mutationOptions({
      mutationFn: deleteCommonCodeGroup,
      meta: { globalError: true },
    }),

  createItem: () =>
    mutationOptions({
      mutationFn: createCommonCodeItem,
      meta: { globalError: true },
    }),

  updateItem: () =>
    mutationOptions({
      mutationFn: updateCommonCodeItem,
      meta: { globalError: true },
    }),

  deleteItem: () =>
    mutationOptions({
      mutationFn: deleteCommonCodeItem,
      meta: { globalError: true },
    }),
}
