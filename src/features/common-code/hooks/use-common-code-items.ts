import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useController, useForm } from "react-hook-form"

import { commonCodeMutations, commonCodeQueries, commonCodeQueryKeys } from "@/features/common-code/api/common-code.api"
import type { CommonCodeItem, CommonCodeItemFormValues } from "@/features/common-code/types/common-code.types"

type FormMode = "create" | "edit" | null

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

function sortItems(items: CommonCodeItem[]) {
  return [...items].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
  )
}

export function useCommonCodeItems(groupId: string | null) {
  const queryClient = useQueryClient()
  const itemQuery = useQuery(commonCodeQueries.items(groupId))
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemFormMode, setItemFormMode] = useState<FormMode>(null)
  const previousGroupId = useRef(groupId)

  const itemForm = useForm<CommonCodeItemFormValues>({
    defaultValues: EMPTY_ITEM_FORM,
  })

  const itemEnabledField = useController({
    control: itemForm.control,
    name: "enabled",
  }).field

  const items = useMemo(
    () => sortItems(itemQuery.data ?? []),
    [itemQuery.data],
  )

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const invalidateItems = (id: string) =>
    queryClient.invalidateQueries({
      queryKey: commonCodeQueryKeys.items(id),
    })

  const createItemMutation = useMutation({
    ...commonCodeMutations.createItem(),
    onSuccess: (item) => {
      setSelectedItemId(item.id)
      setItemFormMode(null)
      itemForm.reset(EMPTY_ITEM_FORM)
      void invalidateItems(item.groupId)
    },
  })

  const updateItemMutation = useMutation({
    ...commonCodeMutations.updateItem(),
    onSuccess: (item) => {
      setItemFormMode(null)
      void invalidateItems(item.groupId)
    },
  })

  const deleteItemMutation = useMutation({
    ...commonCodeMutations.deleteItem(),
    onSuccess: () => {
      setSelectedItemId(null)
      setItemFormMode(null)
      if (groupId) void invalidateItems(groupId)
    },
  })

  function resetItemMutationErrors() {
    createItemMutation.reset()
    updateItemMutation.reset()
    deleteItemMutation.reset()
  }

  function resetForGroupChange() {
    setSelectedItemId(null)
    setItemFormMode(null)
    resetItemMutationErrors()
  }

  useEffect(() => {
    if (previousGroupId.current !== groupId) {
      previousGroupId.current = groupId
      resetForGroupChange()
    }
  }, [groupId])

  function selectItem(item: CommonCodeItem) {
    setSelectedItemId(item.id)
  }

  function startCreateItem() {
    if (!groupId) {
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
    if (!groupId) {
      return
    }

    if (itemFormMode === "create") {
      createItemMutation.mutate({
        ...values,
        groupId,
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
    isLoading: itemQuery.isLoading,
    loadErrorMessage: getErrorMessage(itemQuery.error),
    items,
    selectedItem,
    selectItem,
    resetForGroupChange,
    form: {
      mode: itemFormMode,
      fields: {
        code: itemForm.register("code", {
          required: "코드를 입력해주세요.",
        }),
        name: itemForm.register("name", {
          required: "코드명을 입력해주세요.",
        }),
        description: itemForm.register("description"),
        enabled: {
          checked: itemEnabledField.value,
          onCheckedChange: itemEnabledField.onChange,
        },
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
