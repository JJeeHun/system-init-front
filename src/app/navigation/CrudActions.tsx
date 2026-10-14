import { useNavigationStore } from "@/app/navigation/use-navigation-store"

import type { NavigationPermissions } from "@/features/navigation/types/navigation.types"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"

import { config } from "@/shared/config/config"
import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/ui/button"

type CrudActionsProps = {
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
  editLabel?: string
  deleteLabel?: string
  editError?: boolean
  deleteError?: boolean
}

const FULL_PERMISSIONS: NavigationPermissions = {
  isView: true,
  isCreated: true,
  isUpdated: true,
  isDeleted: true,
}

function canShow(handler: (() => void) | undefined, show: boolean, permitted: boolean | undefined): boolean {
  return Boolean(handler) && show && permitted === true
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
  editLabel,
  deleteLabel,
  editError,
  deleteError,
}: CrudActionsProps & { permissions?: NavigationPermissions }) {
  const { t } = useAppTranslation()

  const canShowCreate = canShow(onCreate, showCreate, permissions?.isCreated)
  const canShowEdit = canShow(onEdit, showEdit, permissions?.isUpdated)
  const canShowDelete = canShow(onDelete, showDelete, permissions?.isDeleted)

  return (
    <>
      {canShowCreate && (
        <Button primary size="sm" disabled={createDisabled} loading={createLoading} onClick={onCreate}>
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
  const currentUser = useCurrentUser()
  const permissions = useNavigationStore(state =>
    Object.values(state.menuIndex).find(entry => entry.menu.id === props.menuId)?.menu.permissions,
  )

  if (config.app.canBypassCrudPermissions(currentUser.data?.roleId)) {
    return <TestAdminButtons {...props} />
  }

  return <CrudActionButtons {...props} permissions={permissions} />
}
