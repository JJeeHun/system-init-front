import { useCallback, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { navigationMutations, navigationQueries, navigationQueryKeys } from "@/features/navigation/api/navigation.api"
import { menuSchema, type MenuFormValues } from "@/features/navigation/schemas/menu.schema"
import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useAppTranslation } from "@/shared/i18n"
import { dialog } from "@/shared/lib/dialog"
import { message } from "@/shared/lib/message"
import { useTree } from "@/shared/ui/tree"

type FormMode = "create" | "edit" | null

const EMPTY_MENU: MenuFormValues = {
  id: "",
  parentId: null,
  label: "",
  kind: "page",
  path: "",
  icon: "settings",
  sortOrder: 10,
  enabled: true,
  scope: "GENERAL",
}

const isMenuGroup = (menu: MenuRecord) => menu.kind === "group"

export function useMenuManagement() {
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const query = useQuery(navigationQueries.management())
  const menus = query.data ?? []
  const [mode, setMode] = useState<FormMode>(null)
  const getSearchText = useCallback((menu: MenuRecord) =>
    [getMenuLabel(menu, t), menu.label, menu.id, menu.path].join(" "), [language, t])
  const tree = useTree({
    items: menus,
    getSearchText,
    isBranch: isMenuGroup,
  })
  const selected = useMemo(() => menus.find((menu) => menu.id === tree.selectedId) ?? null,
    [menus, tree.selectedId])
  const selectedPath = useMemo(() => {
    const segments: string[] = []
    let cursor = selected
    while (cursor) {
      segments.unshift(getMenuLabel(cursor, t))
      cursor = menus.find(menu => menu.id === cursor?.parentId) ?? null
    }
    return segments.join(" / ")
  }, [selected, menus, language, t])

  const form = useForm<MenuFormValues>({ resolver: zodResolver(menuSchema), defaultValues: EMPTY_MENU })


  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: navigationQueryKeys.management() }),
      queryClient.invalidateQueries({ queryKey: navigationQueryKeys.menus() }),
    ])
  }

  const createMutation = useMutation({
    ...navigationMutations.create(),
    onSuccess: (created) => {
      tree.selectNode(created.id)
      setMode(null)
      void refresh()
      message.success(t("navigation:management.messages.created"))
    },
  })
  const updateMutation = useMutation({
    ...navigationMutations.update(),
    onSuccess: () => {
      setMode(null)
      void refresh()
      message.success(t("navigation:management.messages.updated"))
    },
  })
  const deleteMutation = useMutation({
    ...navigationMutations.delete(),
    onSuccess: () => {
      tree.selectNode(null)
      setMode(null)
      void refresh()
      message.success(t("navigation:management.messages.deleted"))
    },
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const resetErrors = () => {
    createMutation.reset()
    updateMutation.reset()
    deleteMutation.reset()
  }

  function selectMenu(menu: MenuRecord) {
    if (saving || deleteMutation.isPending) return
    tree.selectNode(menu.id)
    setMode(null)
  }

  function startCreate(parentId: string | null = null) {
    resetErrors()
    const siblings = menus.filter((menu) => menu.parentId === parentId)
    const nextOrder = Math.max(0, ...siblings.map((menu) => menu.sortOrder)) + 10
    form.reset({ ...EMPTY_MENU, parentId, kind: parentId ? "page" : "group", sortOrder: nextOrder })
    setMode("create")
  }

  function startEdit() {
    if (!selected) return
    resetErrors()
    const { labelKey: _labelKey, ...values } = selected
    form.reset(values)
    setMode("edit")
  }

  function cancel() {
    setMode(null)
    resetErrors()
  }

  const submit = form.handleSubmit((values) => {
    const request = {
      ...values,
      id: values.id.trim(),
      label: values.label.trim(),
      parentId: values.parentId || null,
      path: values.kind === "group" ? "" : values.path.trim(),
      icon: values.kind === "page" ? values.icon : undefined,
    }

    if (mode === "create") {
      runMutation(() => createMutation.mutateAsync(request))
      return
    }
    if (mode === "edit" && selected) {
      runMutation(() => updateMutation.mutateAsync({ id: selected.id, request }))
    }
  })

  async function deleteSelected() {
    if (!selected) return
    const confirmed = await dialog.confirm({
      title: t("navigation:management.deleteTitle"),
      description: t("navigation:management.deleteConfirm", { name: getMenuLabel(selected, t) }),
      confirmLabel: t("common:actions.delete"),
      destructive: true,
    })
    if (!confirmed) return
    resetErrors()
    runMutation(() => deleteMutation.mutateAsync(selected.id))
  }

  return {
    menus,
    tree,
    selectedPath,
    selected,
    selectMenu,
    isLoading: query.isLoading,
    loadError: query.isError ? t("navigation:management.loadError") : null,
    startCreate,
    startEdit,
    deleteSelected,
    mode,
    cancel,
    submit,
    form,
    saving,
    deleting: deleteMutation.isPending,
  }
}
