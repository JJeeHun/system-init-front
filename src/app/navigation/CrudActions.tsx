import { useNavigationStore } from "@/app/navigation/use-navigation-store"

import { useCurrentUser } from "@/features/user/hooks/use-current-user"

import { CrudActions as SharedCrudActions, type CrudActionsProps } from "@/shared/ui/crud-actions"
import { PagePermissionScope } from "@/shared/ui/page-permissions"

import { config } from "@/shared/config/config"

// Retained for existing navigation tests; app pages use shared CrudActions directly.
export function CrudActions({ menuId, ...props }: CrudActionsProps & { menuId: string }) {
  const currentUser = useCurrentUser()
  const permissions = useNavigationStore(state =>
    Object.values(state.menuIndex).find(entry => entry.menu.id === menuId)?.menu.permissions,
  )
  return (
    <PagePermissionScope
      menuId={menuId}
      permissions={permissions}
      bypassCrudPermissions={config.app.canBypassCrudPermissions(currentUser.data?.roleId)}
    >
      <SharedCrudActions {...props} />
    </PagePermissionScope>
  )
}
