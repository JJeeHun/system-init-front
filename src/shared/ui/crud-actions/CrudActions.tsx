import { Button } from "@/shared/ui/button"
import { usePageActionPermission } from "@/shared/ui/page-permissions"

import { useAppTranslation } from "@/shared/i18n"

export type CrudAction = "create" | "edit" | "delete"

export type CrudActionsProps = {
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

function canShow(handler: (() => void) | undefined, show: boolean, permitted: boolean): boolean {
  return Boolean(handler) && show && permitted
}

export function CrudActions({
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
}: CrudActionsProps) {
  const { t } = useAppTranslation()
  const canCreate = usePageActionPermission("create")
  const canEdit = usePageActionPermission("edit")
  const canDelete = usePageActionPermission("delete")

  return (
    <>
      {canShow(onCreate, showCreate, canCreate) && (
        <Button primary size="sm" aria-label={createAriaLabel} disabled={createDisabled} loading={createLoading} onClick={onCreate}>
          {createLabel ?? t("common:actions.create")}
        </Button>
      )}
      {canShow(onEdit, showEdit, canEdit) && (
        <Button size="sm" error={editError} disabled={editDisabled} loading={editLoading} onClick={onEdit}>
          {editLabel ?? t("common:actions.edit")}
        </Button>
      )}
      {canShow(onDelete, showDelete, canDelete) && (
        <Button size="sm" error={deleteError ?? true} disabled={deleteDisabled} loading={deleteLoading} onClick={onDelete}>
          {deleteLabel ?? t("common:actions.delete")}
        </Button>
      )}
    </>
  )
}
