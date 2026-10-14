import { createContext, useContext, type ReactNode } from "react"

import { Button } from "@/shared/ui/button"

import { useAppTranslation } from "@/shared/i18n"

export type CrudPermissions = {
  isCreated: boolean
  isUpdated: boolean
  isDeleted: boolean
}

export type CrudAction = "create" | "edit" | "delete"

export type CrudActionsProps = {
  menuId: string
  onCreate?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showCreate?: boolean
  showEdit?: boolean
  showDelete?: boolean
  createDisabled?: boolean
  editDisabled?: boolean
  deleteDisabled?: boolean
  createLoading?: boolean
  editLoading?: boolean
  deleteLoading?: boolean
  createLabel?: string
  createAriaLabel?: string
  editLabel?: string
  deleteLabel?: string
  editError?: boolean
  deleteError?: boolean
}

type CrudPermissionsContextValue = {
  resolvePermissions: (menuId: string) => CrudPermissions | undefined
  bypassPermissions: boolean
}

const CrudPermissionsContext = createContext<CrudPermissionsContextValue | null>(null)

const FULL_PERMISSIONS: CrudPermissions = {
  isCreated: true,
  isUpdated: true,
  isDeleted: true,
}

const PERMISSION_KEYS: Record<CrudAction, keyof CrudPermissions> = {
  create: "isCreated",
  edit: "isUpdated",
  delete: "isDeleted",
}

function canShow(handler: (() => void) | undefined, show: boolean, permitted: boolean | undefined): boolean {
  return Boolean(handler) && show && permitted === true
}

export function CrudPermissionsProvider({
  children,
  resolvePermissions,
  bypassPermissions = false,
}: {
  children: ReactNode
  resolvePermissions: (menuId: string) => CrudPermissions | undefined
  bypassPermissions?: boolean
}) {
  return (
    <CrudPermissionsContext.Provider value={{ resolvePermissions, bypassPermissions }}>
      {children}
    </CrudPermissionsContext.Provider>
  )
}

function useCrudPermissions(menuId: string): CrudPermissions | undefined {
  const context = useContext(CrudPermissionsContext)
  if (!context) return undefined
  return context.bypassPermissions ? FULL_PERMISSIONS : context.resolvePermissions(menuId)
}

export function useCrudActionPermission(menuId: string, action: CrudAction): boolean {
  const permissions = useCrudPermissions(menuId)
  return permissions?.[PERMISSION_KEYS[action]] === true
}

function CrudActionButtons({
  permissions,
  onCreate,
  onEdit,
  onDelete,
  showCreate = true,
  showEdit = true,
  showDelete = true,
  createDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  createLoading = false,
  editLoading = false,
  deleteLoading = false,
  createLabel,
  createAriaLabel,
  editLabel,
  deleteLabel,
  editError,
  deleteError,
}: CrudActionsProps & { permissions?: CrudPermissions }) {
  const { t } = useAppTranslation()

  const canShowCreate = canShow(onCreate, showCreate, permissions?.isCreated)
  const canShowEdit = canShow(onEdit, showEdit, permissions?.isUpdated)
  const canShowDelete = canShow(onDelete, showDelete, permissions?.isDeleted)

  return (
    <>
      {canShowCreate && (
        <Button primary size="sm" aria-label={createAriaLabel} disabled={createDisabled} loading={createLoading} onClick={onCreate}>
          {createLabel ?? t("common:actions.create")}
        </Button>
      )}
      {canShowEdit && (
        <Button size="sm" error={editError} disabled={editDisabled} loading={editLoading} onClick={onEdit}>
          {editLabel ?? t("common:actions.edit")}
        </Button>
      )}
      {canShowDelete && (
        <Button size="sm" error={deleteError ?? true} disabled={deleteDisabled} loading={deleteLoading} onClick={onDelete}>
          {deleteLabel ?? t("common:actions.delete")}
        </Button>
      )}
    </>
  )
}

function TestAdminButtons(props: CrudActionsProps) {
  return <CrudActionButtons {...props} permissions={FULL_PERMISSIONS} />
}

export function CrudActions(props: CrudActionsProps) {
  const context = useContext(CrudPermissionsContext)
  const permissions = useCrudPermissions(props.menuId)

  if (context?.bypassPermissions) {
    return <TestAdminButtons {...props} />
  }

  return <CrudActionButtons {...props} permissions={permissions} />
}
