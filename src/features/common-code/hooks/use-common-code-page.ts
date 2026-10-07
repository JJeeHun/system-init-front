import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import {
  commonCodeMutations,
  commonCodeQueries,
  commonCodeQueryKeys,
} from "@/features/common-code/api/common-code.api"
import type {
  CommonCodeGroup,
  CommonCodeGroupFormValues,
  CommonCodeItem,
  CommonCodeItemFormValues,
} from "@/features/common-code/types/common-code.types"

type FormMode = "create" | "edit" | null

const EMPTY_GROUP_FORM: CommonCodeGroupFormValues = {
  code: "",
  name: "",
  description: "",
  enabled: true,
  sortOrder: 10,
}

const EMPTY_ITEM_FORM: CommonCodeItemFormValues = {
  code: "",
  name: "",
  description: "",
  enabled: true,
  sortOrder: 10,
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null
}

function sortGroups(groups: CommonCodeGroup[]) {
  return [...groups].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
  )
}

function sortItems(items: CommonCodeItem[]) {
  return [...items].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
  )
}

export function useCommonCodePage() {
  const queryClient = useQueryClient()
  const commonCodeQuery = useQuery(commonCodeQueries.all())

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [groupFormMode, setGroupFormMode] = useState<FormMode>(null)
  const [itemFormMode, setItemFormMode] = useState<FormMode>(null)

  const groupForm = useForm<CommonCodeGroupFormValues>({
    defaultValues: EMPTY_GROUP_FORM,
  })

  const itemForm = useForm<CommonCodeItemFormValues>({
    defaultValues: EMPTY_ITEM_FORM,
  })

  const groups = useMemo(
    () => sortGroups(commonCodeQuery.data?.groups ?? []),
    [commonCodeQuery.data?.groups],
  )

  const selectedGroup = useMemo(
    () =>
      groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId],
  )

  const items = useMemo(
    () =>
      sortItems(
        (commonCodeQuery.data?.items ?? []).filter(
          (item) => item.groupId === selectedGroup?.id,
        ),
      ),
    [commonCodeQuery.data?.items, selectedGroup?.id],
  )

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const invalidateCommonCodes = () =>
    queryClient.invalidateQueries({
      queryKey: commonCodeQueryKeys.all,
    })

  const createGroupMutation = useMutation({
    ...commonCodeMutations.createGroup(),
    onSuccess: (group) => {
      setSelectedGroupId(group.id)
      setSelectedItemId(null)
      setGroupFormMode(null)
      groupForm.reset(EMPTY_GROUP_FORM)
      void invalidateCommonCodes()
    },
  })

  const updateGroupMutation = useMutation({
    ...commonCodeMutations.updateGroup(),
    onSuccess: () => {
      setGroupFormMode(null)
      void invalidateCommonCodes()
    },
  })

  const deleteGroupMutation = useMutation({
    ...commonCodeMutations.deleteGroup(),
    onSuccess: () => {
      setSelectedGroupId(null)
      setSelectedItemId(null)
      setGroupFormMode(null)
      setItemFormMode(null)
      void invalidateCommonCodes()
    },
  })

  const createItemMutation = useMutation({
    ...commonCodeMutations.createItem(),
    onSuccess: (item) => {
      setSelectedItemId(item.id)
      setItemFormMode(null)
      itemForm.reset(EMPTY_ITEM_FORM)
      void invalidateCommonCodes()
    },
  })

  const updateItemMutation = useMutation({
    ...commonCodeMutations.updateItem(),
    onSuccess: () => {
      setItemFormMode(null)
      void invalidateCommonCodes()
    },
  })

  const deleteItemMutation = useMutation({
    ...commonCodeMutations.deleteItem(),
    onSuccess: () => {
      setSelectedItemId(null)
      setItemFormMode(null)
      void invalidateCommonCodes()
    },
  })

  function resetGroupMutationErrors() {
    createGroupMutation.reset()
    updateGroupMutation.reset()
    deleteGroupMutation.reset()
  }

  function resetItemMutationErrors() {
    createItemMutation.reset()
    updateItemMutation.reset()
    deleteItemMutation.reset()
  }

  function selectGroup(group: CommonCodeGroup) {
    setSelectedGroupId(group.id)
    setSelectedItemId(null)
    setItemFormMode(null)
    resetItemMutationErrors()
  }

  function selectItem(item: CommonCodeItem) {
    setSelectedItemId(item.id)
  }

  function startCreateGroup() {
    resetGroupMutationErrors()
    groupForm.reset({
      ...EMPTY_GROUP_FORM,
      sortOrder: (groups.at(-1)?.sortOrder ?? 0) + 10,
    })
    setGroupFormMode("create")
  }

  function startEditGroup() {
    if (!selectedGroup) {
      return
    }

    resetGroupMutationErrors()
    groupForm.reset({
      code: selectedGroup.code,
      name: selectedGroup.name,
      description: selectedGroup.description,
      enabled: selectedGroup.enabled,
      sortOrder: selectedGroup.sortOrder,
    })
    setGroupFormMode("edit")
  }

  function cancelGroupForm() {
    setGroupFormMode(null)
    resetGroupMutationErrors()
  }

  const submitGroup = groupForm.handleSubmit((values) => {
    if (groupFormMode === "create") {
      createGroupMutation.mutate({
        ...values,
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
      })
      return
    }

    if (groupFormMode === "edit" && selectedGroup) {
      updateGroupMutation.mutate({
        id: selectedGroup.id,
        request: {
          name: values.name.trim(),
          description: values.description.trim(),
          enabled: values.enabled,
          sortOrder: values.sortOrder,
        },
      })
    }
  })

  function deleteGroup() {
    if (!selectedGroup) {
      return
    }

    const confirmed = window.confirm(
      '"' + selectedGroup.name + '" 그룹을 삭제하시겠습니까?',
    )

    if (confirmed) {
      resetGroupMutationErrors()
      deleteGroupMutation.mutate(selectedGroup.id)
    }
  }

  function startCreateItem() {
    if (!selectedGroup) {
      return
    }

    resetItemMutationErrors()
    itemForm.reset({
      ...EMPTY_ITEM_FORM,
      sortOrder: (items.at(-1)?.sortOrder ?? 0) + 10,
    })
    setItemFormMode("create")
  }

  function startEditItem() {
    if (!selectedItem) {
      return
    }

    resetItemMutationErrors()
    itemForm.reset({
      code: selectedItem.code,
      name: selectedItem.name,
      description: selectedItem.description,
      enabled: selectedItem.enabled,
      sortOrder: selectedItem.sortOrder,
    })
    setItemFormMode("edit")
  }

  function cancelItemForm() {
    setItemFormMode(null)
    resetItemMutationErrors()
  }

  const submitItem = itemForm.handleSubmit((values) => {
    if (!selectedGroup) {
      return
    }

    if (itemFormMode === "create") {
      createItemMutation.mutate({
        ...values,
        groupId: selectedGroup.id,
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
      })
      return
    }

    if (itemFormMode === "edit" && selectedItem) {
      updateItemMutation.mutate({
        id: selectedItem.id,
        request: {
          name: values.name.trim(),
          description: values.description.trim(),
          enabled: values.enabled,
          sortOrder: values.sortOrder,
        },
      })
    }
  })

  function deleteItem() {
    if (!selectedItem) {
      return
    }

    const confirmed = window.confirm(
      '"' + selectedItem.name + '" 코드를 삭제하시겠습니까?',
    )

    if (confirmed) {
      resetItemMutationErrors()
      deleteItemMutation.mutate(selectedItem.id)
    }
  }

  return {
    isLoading: commonCodeQuery.isLoading,
    loadErrorMessage: getErrorMessage(commonCodeQuery.error),
    groups,
    selectedGroup,
    items,
    selectedItem,
    selectGroup,
    selectItem,
    groupForm: {
      mode: groupFormMode,
      fields: {
        code: groupForm.register("code", {
          required: "그룹 코드를 입력해주세요.",
        }),
        name: groupForm.register("name", {
          required: "그룹명을 입력해주세요.",
        }),
        description: groupForm.register("description"),
        enabled: groupForm.register("enabled"),
        sortOrder: groupForm.register("sortOrder", {
          required: "정렬순서를 입력해주세요.",
          valueAsNumber: true,
          min: {
            value: 0,
            message: "정렬순서는 0 이상이어야 합니다.",
          },
        }),
      },
      errors: {
        code: groupForm.formState.errors.code?.message ?? null,
        name: groupForm.formState.errors.name?.message ?? null,
        sortOrder: groupForm.formState.errors.sortOrder?.message ?? null,
      },
      isPending:
        createGroupMutation.isPending || updateGroupMutation.isPending,
      isDeleting: deleteGroupMutation.isPending,
      errorMessage: getErrorMessage(
        createGroupMutation.error ??
          updateGroupMutation.error ??
          deleteGroupMutation.error,
      ),
      startCreate: startCreateGroup,
      startEdit: startEditGroup,
      cancel: cancelGroupForm,
      submit: submitGroup,
      delete: deleteGroup,
    },
    itemForm: {
      mode: itemFormMode,
      fields: {
        code: itemForm.register("code", {
          required: "코드를 입력해주세요.",
        }),
        name: itemForm.register("name", {
          required: "코드명을 입력해주세요.",
        }),
        description: itemForm.register("description"),
        enabled: itemForm.register("enabled"),
        sortOrder: itemForm.register("sortOrder", {
          required: "정렬순서를 입력해주세요.",
          valueAsNumber: true,
          min: {
            value: 0,
            message: "정렬순서는 0 이상이어야 합니다.",
          },
        }),
      },
      errors: {
        code: itemForm.formState.errors.code?.message ?? null,
        name: itemForm.formState.errors.name?.message ?? null,
        sortOrder: itemForm.formState.errors.sortOrder?.message ?? null,
      },
      isPending: createItemMutation.isPending || updateItemMutation.isPending,
      isDeleting: deleteItemMutation.isPending,
      errorMessage: getErrorMessage(
        createItemMutation.error ??
          updateItemMutation.error ??
          deleteItemMutation.error,
      ),
      startCreate: startCreateItem,
      startEdit: startEditItem,
      cancel: cancelItemForm,
      submit: submitItem,
      delete: deleteItem,
    },
  }
}
