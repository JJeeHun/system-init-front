import { useMemo, useState } from "react"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useController, useForm } from "react-hook-form"
import { message } from "@/shared/lib/message"
import { dialog } from "@/shared/lib/dialog"

import { commonCodeMutations, commonCodeQueries, commonCodeQueryKeys } from "@/features/common-code/api/common-code.api"
import type { CommonCodeGroup, CommonCodeGroupFormValues } from "@/features/common-code/types/common-code.types"

type FormMode = "create" | "edit" | null

const EMPTY_GROUP_FORM: CommonCodeGroupFormValues = {
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

export function useCommonCodeGroups() {
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const groupQuery = useQuery(commonCodeQueries.groups())
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupFormMode, setGroupFormMode] = useState<FormMode>(null)

  const groupForm = useForm<CommonCodeGroupFormValues>({
    defaultValues: EMPTY_GROUP_FORM,
  })

  const groupEnabledField = useController({
    control: groupForm.control,
    name: "enabled",
  }).field

  const groups = useMemo(
    () => sortGroups(groupQuery.data ?? []),
    [groupQuery.data],
  )

  const selectedGroup = useMemo(
    () =>
      groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId],
  )

  const invalidateGroups = () =>
    queryClient.invalidateQueries({
      queryKey: commonCodeQueryKeys.groups,
    })

  const createGroupMutation = useMutation({
    ...commonCodeMutations.createGroup(),
    onSuccess: (group) => {
      setSelectedGroupId(group.id)
      setGroupFormMode(null)
      groupForm.reset(EMPTY_GROUP_FORM)
      void invalidateGroups()
      message.success("코드 그룹이 등록되었습니다.")
    },
  })

  const updateGroupMutation = useMutation({
    ...commonCodeMutations.updateGroup(),
    onSuccess: () => {
      setGroupFormMode(null)
      void invalidateGroups()
      message.success("코드 그룹이 수정되었습니다.")
    },
  })

  const deleteGroupMutation = useMutation({
    ...commonCodeMutations.deleteGroup(),
    onSuccess: () => {
      setSelectedGroupId(null)
      setGroupFormMode(null)
      void invalidateGroups()
      message.success("코드 그룹이 삭제되었습니다.")
    },
  })

  function resetGroupMutationErrors() {
    createGroupMutation.reset()
    updateGroupMutation.reset()
    deleteGroupMutation.reset()
  }

  function selectGroup(group: CommonCodeGroup) {
    setSelectedGroupId(group.id)
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
      runMutation(() => createGroupMutation.mutateAsync({
        ...values,
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
      }))
      return
    }

    if (groupFormMode === "edit" && selectedGroup) {
      runMutation(() => updateGroupMutation.mutateAsync({
        id: selectedGroup.id,
        request: {
          name: values.name.trim(),
          description: values.description.trim(),
          enabled: values.enabled,
          sortOrder: values.sortOrder,
        },
      }))
    }
  })

  async function deleteGroup() {
    if (!selectedGroup) return

    const confirmed = await dialog.confirm({
      title: "그룹 삭제",
      description: `"${selectedGroup.name}" 그룹을 삭제하시겠습니까?`,
      confirmLabel: "삭제",
      destructive: true,
    })
    if (!confirmed) return

    resetGroupMutationErrors()
    runMutation(() => deleteGroupMutation.mutateAsync(selectedGroup.id))
  }

  return {
    isLoading: groupQuery.isLoading,
    loadErrorMessage: getErrorMessage(groupQuery.error),
    groups,
    selectedGroup,
    selectGroup,
    form: {
      mode: groupFormMode,
      fields: {
        code: groupForm.register("code", {
          required: "그룹 코드를 입력해주세요.",
        }),
        name: groupForm.register("name", {
          required: "그룹명을 입력해주세요.",
        }),
        description: groupForm.register("description"),
        enabled: {
          checked: groupEnabledField.value,
          onCheckedChange: groupEnabledField.onChange,
        },
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
      startCreate: startCreateGroup,
      startEdit: startEditGroup,
      cancel: cancelGroupForm,
      submit: submitGroup,
      delete: deleteGroup,
    },

  }
}
