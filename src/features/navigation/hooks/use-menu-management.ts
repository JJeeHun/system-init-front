import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { navigationMutations, navigationQueries, navigationQueryKeys } from "@/features/navigation/api/navigation.api"
import type { MenuInput, MenuRecord } from "@/features/navigation/types/menu-management.types"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useAppTranslation } from "@/shared/i18n"
import { dialog } from "@/shared/lib/dialog"
import { message } from "@/shared/lib/message"

type FormMode = "create" | "edit" | null

const EMPTY_MENU: MenuInput = {
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

export function useMenuManagement() {
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const query = useQuery(navigationQueries.management())
  const menus = query.data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<FormMode>(null)
  const [treeKeyword, setTreeKeyword] = useState("")
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])
  const filteredMenus = useMemo(() => {
    const keyword = treeKeyword.trim().toLocaleLowerCase()
    if (!keyword) return menus

    const byId = new Map(menus.map(menu => [menu.id, menu]))
    const visible = new Set<string>()
    const childrenByParent = new Map<string, MenuRecord[]>()
    for (const menu of menus) {
      if (!menu.parentId) continue
      const siblings = childrenByParent.get(menu.parentId) ?? []
      siblings.push(menu)
      childrenByParent.set(menu.parentId, siblings)
    }
    for (const menu of menus) {
      if (![getMenuLabel(menu, t), menu.label, menu.id, menu.path].some(value =>
        value.toLocaleLowerCase().includes(keyword))) continue

      let current: MenuRecord | undefined = menu
      while (current) {
        visible.add(current.id)
        current = current.parentId ? byId.get(current.parentId) : undefined
      }
      if (menu.kind === "group") {
        const stack = [menu.id]
        while (stack.length) {
          for (const child of childrenByParent.get(stack.pop()!) ?? []) {
            visible.add(child.id)
            if (child.kind === "group") stack.push(child.id)
          }
        }
      }
    }
    return menus.filter(menu => visible.has(menu.id))
  }, [menus, treeKeyword, language, t])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(() => menus.find((menu) => menu.id === selectedId) ?? null, [menus, selectedId])
  const selectedPath = useMemo(() => {
    const segments: string[] = []
    let cursor = selected
    while (cursor) {
      segments.unshift(getMenuLabel(cursor, t))
      cursor = menus.find(menu => menu.id === cursor?.parentId) ?? null
    }
    return segments.join(" / ")
  }, [selected, menus, language, t])

  function toggleGroup(id: string) {
    setCollapsedGroups(current => current.includes(id) ?
      current.filter(groupId => groupId !== id) : [...current, id])
  }
  const form = useForm<MenuInput>({ defaultValues: EMPTY_MENU })

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) void form.trigger()
  }, [language])

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: navigationQueryKeys.management() }),
      queryClient.invalidateQueries({ queryKey: navigationQueryKeys.menus() }),
    ])
  }

  const createMutation = useMutation({
    ...navigationMutations.create(),
    onSuccess: (created) => {
      setSelectedId(created.id)
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
      setSelectedId(null)
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
    setSelectedId(menu.id)
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
    filteredMenus,
    treeKeyword,
    setTreeKeyword,
    collapsedGroups,
    toggleGroup,
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
