import { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, useWatch } from "react-hook-form"

import { navigationQueries } from "@/features/navigation/api/navigation.api"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import { canCreateRole, canDelegateAction, canManageRole } from "@/features/role/lib/role-delegation"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"
import { roleMutations, roleQueries, roleQueryKeys } from "@/features/role/api/role-management.api"
import { roleSchema, type RoleFormValues } from "@/features/role/schemas/role.schema"
import { roleSearchSchema, type RoleSearchFormValues } from "@/features/role/schemas/role-search.schema"
import { rolePermissionSchema, type RolePermissionFormValues } from "@/features/role/schemas/role-permission.schema"
import type { RoleAction } from "@/features/role/types/role-management.types"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"
import { useAppTranslation } from "@/shared/i18n"
import { dialog } from "@/shared/lib/dialog"
import { message } from "@/shared/lib/message"
import { useTree } from "@/shared/ui/tree"

type Mode = "create" | "edit" | null
const EMPTY_ROLE: RoleFormValues = { id: "", name: "", description: "" }

const isMenuGroup = (menu: MenuRecord) => menu.kind === "group"

export function useRoleManagement() {
  const { t, language } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()
  const currentUser = useCurrentUser()
  const rolesQuery = useQuery(roleQueries.list())
  const menuQuery = useQuery(navigationQueries.management())
  const roles = rolesQuery.data ?? []
  const allMenus = menuQuery.data ?? []
  const actorRoleId = currentUser.data?.roleId ?? null
  const actorPermissionsQuery = useQuery(roleQueries.permissions(actorRoleId))
  const actor = roles.find(role => role.id === actorRoleId) ?? null
  const actorGrants = actorPermissionsQuery.data?.grants ?? []
  const manageableRoles = roles.filter(role => canManageRole(actor, role, actorGrants))
  const visiblePages = allMenus.filter(menu => menu.kind === "page" && canDelegateAction(actor, menu, "view"))
  const visibleIds = new Set(visiblePages.map(menu => menu.id))
  for (const menu of visiblePages) {
    let parentId = menu.parentId
    while (parentId) {
      if (visibleIds.has(parentId)) break
      visibleIds.add(parentId)
      parentId = allMenus.find(parent => parent.id === parentId)?.parentId ?? null
    }
  }
  const menus = allMenus.filter(menu => visibleIds.has(menu.id))
  const getMenuSearchText = useCallback((menu: MenuRecord) =>
    [getMenuLabel(menu, t), menu.label, menu.id, menu.path].join(" "), [language, t])
  const menuTree = useTree({ items: menus, getSearchText: getMenuSearchText, isBranch: isMenuGroup })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = manageableRoles.find(role => role.id === selectedId) ?? null
  const [mode, setMode] = useState<Mode>(null)
  const roleForm = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema), defaultValues: EMPTY_ROLE })
  const searchForm = useForm<RoleSearchFormValues>({ resolver: zodResolver(roleSearchSchema), defaultValues: { keyword: "" } })
  const [keyword, setKeyword] = useState("")
  const filteredRoles = useMemo(() => manageableRoles.filter(role =>
    [role.id, role.name, role.description].some(value => value.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())),
  ), [roles, keyword, actorRoleId, actorGrants])

  const permissionsQuery = useQuery(roleQueries.permissions(selectedId))
  const permissionForm = useForm<RolePermissionFormValues>({ resolver: zodResolver(rolePermissionSchema), defaultValues: { grants: [] } })
  const { reset: resetPermissions, setValue: setPermissionValue, getValues: getPermissions } = permissionForm
  const grants = useWatch({ control: permissionForm.control, name: "grants" }) ?? []
  const permissionDirty = permissionForm.formState.isDirty

  useEffect(() => {
    if (selectedId && manageableRoles.some(role => role.id === selectedId)) return
    setSelectedId(manageableRoles[0]?.id ?? null)
  }, [selectedId, roles, actorRoleId, actorGrants])
  useEffect(() => {
    if (permissionsQuery.data?.roleId === selectedId) {
      resetPermissions({ grants: permissionsQuery.data.grants })
    }
  }, [selectedId, permissionsQuery.data, resetPermissions])

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
    if (busy || !canCreateRole(actor, actorGrants)) return
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
    if (!actorRoleId) return
    if (mode === "create") runMutation(() => createMutation.mutateAsync({ ...input, actorRoleId }))
    if (mode === "edit" && selected) {
      runMutation(() => updateMutation.mutateAsync({ id: selected.id, request: input, actorRoleId }))
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
    if (confirmed) runMutation(() => deleteMutation.mutateAsync({ id: selected.id, actorRoleId: actorRoleId! }))
  }

  function canGrant(menuId: string, action: RoleAction) {
    return canDelegateAction(actor, allMenus.find(menu => menu.id === menuId)!, action) && !!selected
  }

  function isAllowed(menuId: string, action: RoleAction) {
    return grants.some(grant => grant.menuId === menuId && grant.actions.includes(action))
  }

  function togglePermission(menuId: string, action: RoleAction, allowed: boolean) {
    if (!selected || busy || permissionsQuery.isLoading || menuQuery.isLoading || !canGrant(menuId, action)) return
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

  const savePermissions = permissionForm.handleSubmit(({ grants }) => {
    if (!selected || busy || !permissionDirty || !actorRoleId) return
    const validMenus = new Set(allMenus.filter(menu => menu.kind === "page").map(menu => menu.id))
    const request = {
      roleId: selected.id,
      actorRoleId,
      grants: grants.filter(grant => validMenus.has(grant.menuId)),
    }
    runMutation(() => permissionMutation.mutateAsync(request))
  })

  return {
    roles: filteredRoles, selected, selectRole, searchForm,
    canCreate: canCreateRole(actor, actorGrants), canGrant,
    search: searchForm.handleSubmit(values => setKeyword(values.keyword.trim())),
    resetSearch: () => { searchForm.reset({ keyword: "" }); setKeyword("") },
    rolesLoading: rolesQuery.isLoading, rolesError: rolesQuery.isError,
    menus, menuTree, menusLoading: menuQuery.isLoading, menusError: menuQuery.isError,
    permissionsLoading: permissionsQuery.isLoading, permissionsError: permissionsQuery.isError,
    startCreate, startEdit, deleteSelected, mode, roleForm, submit, cancel, savingRole, busy,
    canDelete: selected !== null && !["SYSTEM", "ADMIN", "MANAGER", "STAFF"].includes(selected.id),
    isAllowed, togglePermission, permissionDirty, savePermissions, cancelPermissions, savingPermissions,
  }
}
