import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { userManagementMutations, userManagementQueries, userManagementQueryKeys } from "@/features/user/api/user-management.api"
import type { UserAccountInput, UserFilters } from "@/features/user/types/user-management.types"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useAppTranslation } from "@/shared/i18n"
import { dialog } from "@/shared/lib/dialog"
import { message } from "@/shared/lib/message"

type FormMode = "create" | "edit" | null

const EMPTY_FILTERS: UserFilters = { keyword: "", status: "all", role: "all" }
const EMPTY_USER: UserAccountInput = { id: "", name: "", email: "", center: "SEOUL", role: "STAFF", enabled: true }

export function useUserManagement() {
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()

  const searchForm = useForm<UserFilters>({ defaultValues: EMPTY_FILTERS })
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS)
  const query = useQuery(userManagementQueries.list(filters))
  const users = query.data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(() => users.find(user => user.id === selectedId) ?? null, [users, selectedId])

  const form = useForm<UserAccountInput>({ defaultValues: EMPTY_USER })
  const [mode, setMode] = useState<FormMode>(null)

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) void form.trigger()
  }, [language])

  const refresh = () => queryClient.invalidateQueries({ queryKey: userManagementQueryKeys.all })

  const createMutation = useMutation({
    ...userManagementMutations.create(),
    onSuccess: (created) => {
      setMode(null)
      setSelectedId(created.id)
      void refresh()
      message.success(t("user:messages.created"))
    },
  })
  const updateMutation = useMutation({
    ...userManagementMutations.update(),
    onSuccess: () => {
      setMode(null)
      void refresh()
      message.success(t("user:messages.updated"))
    },
  })
  const statusMutation = useMutation({
    ...userManagementMutations.changeEnabled(),
    onSuccess: () => {
      void refresh()
      message.success(t("user:messages.statusChanged"))
    },
  })

  const saving = createMutation.isPending || updateMutation.isPending
  const busy = saving || statusMutation.isPending

  function startCreate() {
    if (busy) return
    form.reset(EMPTY_USER)
    setMode("create")
  }

  function startEdit() {
    if (!selected || busy) return
    form.reset(selected)
    setMode("edit")
  }

  function cancel() {
    if (!saving) setMode(null)
  }

  const submit = form.handleSubmit(values => {
    const normalized = {
      ...values,
      id: values.id.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
    }
    if (mode === "create") {
      runMutation(() => createMutation.mutateAsync(normalized))
    } else if (mode === "edit" && selected) {
      const { id: _id, ...request } = normalized
      runMutation(() => updateMutation.mutateAsync({ id: selected.id, request }))
    }
  })

  async function toggleEnabled() {
    if (!selected || busy) return
    const enabled = !selected.enabled
    const confirmed = await dialog.confirm({
      title: t(enabled ? "user:confirm.enableTitle" : "user:confirm.disableTitle"),
      description: t(enabled ? "user:confirm.enableDescription" : "user:confirm.disableDescription", { name: selected.name }),
      confirmLabel: t(enabled ? "user:actions.enable" : "user:actions.disable"),
      destructive: !enabled,
    })
    if (!confirmed) return
    runMutation(() => statusMutation.mutateAsync({ id: selected.id, enabled }))
  }

  const search = searchForm.handleSubmit(values => {
    setSelectedId(null)
    setFilters({ ...values, keyword: values.keyword.trim() })
  })

  function resetSearch() {
    searchForm.reset(EMPTY_FILTERS)
    setSelectedId(null)
    setFilters({ ...EMPTY_FILTERS })
  }

  return {
    searchForm,
    search,
    resetSearch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    loadError: query.isError ? t("user:messages.loadError") : null,
    users,
    selected,
    selectUser: (user: { id: string }) => setSelectedId(user.id),
    startCreate,
    startEdit,
    toggleEnabled,
    mode,
    form,
    submit,
    cancel,
    saving,
    statusPending: statusMutation.isPending,
  }
}
