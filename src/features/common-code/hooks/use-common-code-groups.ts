import { useEffect, useMemo, useState } from "react"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useController, useForm } from "react-hook-form"
import { message } from "@/shared/lib/message"
import { useAppTranslation } from "@/shared/i18n"
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
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const groupQuery = useQuery(commonCodeQueries.groups())
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupFormMode, setGroupFormMode] = useState<FormMode>(null)

  const groupForm = useForm<CommonCodeGroupFormValues>({
    defaultValues: EMPTY_GROUP_FORM,
  })

  useEffect(() => {
    if (Object.keys(groupForm.formState.errors).length > 0) void groupForm.trigger()
  }, [language])

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
      message.success(t("common-code:messages.groupCreated"))
    },
  })

  const updateGroupMutation = useMutation({
    ...commonCodeMutations.updateGroup(),
    onSuccess: () => {
      setGroupFormMode(null)
      void invalidateGroups()
      message.success(t("common-code:messages.groupUpdated"))
    },
  })

  const deleteGroupMutation = useMutation({
    ...commonCodeMutations.deleteGroup(),
    onSuccess: () => {
      setSelectedGroupId(null)
      setGroupFormMode(null)
      void invalidateGroups()
      message.success(t("common-code:messages.groupDeleted"))
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
      title: t("common-code:group.delete"),
      description: t("common-code:group.deleteConfirm", { name: selectedGroup.name }),
      confirmLabel: t("common:actions.delete"),
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
          required: t("common-code:validation.groupCodeRequired"),
        }),
        name: groupForm.register("name", {
          required: t("common-code:validation.groupNameRequired"),
        }),
        description: groupForm.register("description"),
        enabled: {
          checked: groupEnabledField.value,
          onCheckedChange: groupEnabledField.onChange,
        },
        sortOrder: groupForm.register("sortOrder", {
          required: t("common-code:validation.sortOrderRequired"),
          valueAsNumber: true,
          min: {
            value: 0,
            message: t("common-code:validation.sortOrderMin"),
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
