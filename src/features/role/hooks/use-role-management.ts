import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, useWatch } from "react-hook-form"

import { navigationQueries } from "@/features/navigation/api/navigation.api"
import { roleMutations, roleQueries, roleQueryKeys } from "@/features/role/api/role-management.api"
import type { RoleAction, RoleInput, RoleMenuGrant } from "@/features/role/types/role-management.types"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useAppTranslation } from "@/shared/i18n"
import { dialog } from "@/shared/lib/dialog"
import { message } from "@/shared/lib/message"

type Mode = "create" | "edit" | null
type PermissionForm = { grants: RoleMenuGrant[] }
const EMPTY_ROLE: RoleInput = { id: "", name: "", description: "" }

export function useRoleManagement() {
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const rolesQuery = useQuery(roleQueries.list())
  const menuQuery = useQuery(navigationQueries.management())
  const roles = rolesQuery.data ?? []
  const menus = menuQuery.data ?? []

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = roles.find(role => role.id === selectedId) ?? null
  const [mode, setMode] = useState<Mode>(null)
  const roleForm = useForm<RoleInput>({ defaultValues: EMPTY_ROLE })
  const searchForm = useForm<{ keyword: string }>({ defaultValues: { keyword: "" } })
  const [keyword, setKeyword] = useState("")
  const filteredRoles = useMemo(() => roles.filter(role =>
    [role.id, role.name, role.description].some(value => value.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())),
  ), [roles, keyword])

  const permissionsQuery = useQuery(roleQueries.permissions(selectedId))
  const permissionForm = useForm<PermissionForm>({ defaultValues: { grants: [] } })
  const { reset: resetPermissions, setValue: setPermissionValue, getValues: getPermissions } = permissionForm
  const grants = useWatch({ control: permissionForm.control, name: "grants" }) ?? []
  const permissionDirty = permissionForm.formState.isDirty

  useEffect(() => {
    if (!selectedId && roles.length > 0) setSelectedId(roles[0].id)
  }, [selectedId, roles])
  useEffect(() => {
    if (permissionsQuery.data?.roleId === selectedId) {
      resetPermissions({ grants: permissionsQuery.data.grants })
    }
  }, [selectedId, permissionsQuery.data, resetPermissions])
  useEffect(() => {
    if (Object.keys(roleForm.formState.errors).length > 0) void roleForm.trigger()
  }, [language])

  const refreshRoles = () => queryClient.invalidateQueries({ queryKey: roleQueryKeys.list() })
  const createMutation = useMutation({
    ...roleMutations.create(),
    onSuccess: role => {
      setMode(null)
      setSelectedId(role.id)
      void refreshRoles()
      message.success(t("role:messages.created"))
    },
  })
  const updateMutation = useMutation({
    ...roleMutations.update(),
    onSuccess: () => {
      setMode(null)
      void refreshRoles()
      message.success(t("role:messages.updated"))
    },
  })
  const deleteMutation = useMutation({
    ...roleMutations.delete(),
    onSuccess: () => {
      setSelectedId(null)
      resetPermissions({ grants: [] })
      void refreshRoles()
      message.success(t("role:messages.deleted"))
    },
  })
  const permissionMutation = useMutation({
    ...roleMutations.permissions(),
    onSuccess: saved => {
      resetPermissions({ grants: saved.grants })
      void queryClient.invalidateQueries({ queryKey: roleQueryKeys.permissions(saved.roleId) })
      message.success(t("role:messages.permissionsSaved"))
    },
  })
  const savingRole = createMutation.isPending || updateMutation.isPending
  const savingPermissions = permissionMutation.isPending
  const busy = savingRole || deleteMutation.isPending || savingPermissions

  async function selectRole(id: string) {
    if (id === selectedId || busy || mode) return
    if (permissionDirty) {
      const confirmed = await dialog.confirm({
        title: t("role:confirm.discardTitle"),
        description: t("role:confirm.discardDescription"),
      })
      if (!confirmed) return
    }
    resetPermissions({ grants: [] })
    setSelectedId(id)
  }

  function startCreate() {
    if (busy) return
    roleForm.reset(EMPTY_ROLE)
    setMode("create")
  }

  function startEdit() {
    if (!selected || busy) return
    roleForm.reset(selected)
    setMode("edit")
  }

  function cancel() {
    if (!savingRole) setMode(null)
  }

  const submit = roleForm.handleSubmit(values => {
    const input = { id: values.id.trim(), name: values.name.trim(), description: values.description.trim() }
    if (mode === "create") runMutation(() => createMutation.mutateAsync(input))
    if (mode === "edit" && selected) {
      runMutation(() => updateMutation.mutateAsync({ id: selected.id, request: input }))
    }
  })

  async function deleteSelected() {
    if (!selected || busy) return
    const confirmed = await dialog.confirm({
      title: t("role:confirm.deleteTitle"),
      description: t("role:confirm.deleteDescription", { name: selected.name }),
      confirmLabel: t("common:actions.delete"),
      destructive: true,
    })
    if (confirmed) runMutation(() => deleteMutation.mutateAsync(selected.id))
  }

  function isAllowed(menuId: string, action: RoleAction) {
    return grants.some(grant => grant.menuId === menuId && grant.actions.includes(action))
  }

  function togglePermission(menuId: string, action: RoleAction, allowed: boolean) {
    if (!selected || busy || permissionsQuery.isLoading || menuQuery.isLoading) return
    const existing = getPermissions("grants")
    const current = existing.find(grant => grant.menuId === menuId)?.actions ?? []
    let actions: RoleAction[]
    if (action === "view" && !allowed) actions = []
    else if (allowed) actions = Array.from(new Set<RoleAction>(["view", ...current, action]))
    else actions = current.filter(item => item !== action)
    const next = existing.filter(grant => grant.menuId !== menuId)
    if (actions.length > 0) next.push({ menuId, actions })
    setPermissionValue("grants", next, { shouldDirty: true })
  }

  function cancelPermissions() {
    if (busy) return
    resetPermissions({ grants: permissionsQuery.data?.grants ?? [] })
  }

  function savePermissions() {
    if (!selected || busy || !permissionDirty) return
    const validMenus = new Set(menus.filter(menu => menu.kind === "page").map(menu => menu.id))
    const request = {
      roleId: selected.id,
      grants: getPermissions("grants").filter(grant => validMenus.has(grant.menuId)),
    }
    runMutation(() => permissionMutation.mutateAsync(request))
  }

  return {
    roles: filteredRoles, selected, selectRole, searchForm,
    search: searchForm.handleSubmit(values => setKeyword(values.keyword.trim())),
    resetSearch: () => { searchForm.reset({ keyword: "" }); setKeyword("") },
    rolesLoading: rolesQuery.isLoading, rolesError: rolesQuery.isError,
    menus, menusLoading: menuQuery.isLoading, menusError: menuQuery.isError,
    permissionsLoading: permissionsQuery.isLoading, permissionsError: permissionsQuery.isError,
    startCreate, startEdit, deleteSelected, mode, roleForm, submit, cancel, savingRole, busy,
    canDelete: selected !== null && selected.id !== "ADMIN" && selected.id !== "STAFF",
    isAllowed, togglePermission, permissionDirty, savePermissions, cancelPermissions, savingPermissions,
  }
}
