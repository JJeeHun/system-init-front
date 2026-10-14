import { useNavigationStore } from "@/app/navigation/use-navigation-store"

import { useCurrentUser } from "@/features/user/hooks/use-current-user"

import { CrudActions as SharedCrudActions, CrudPermissionsProvider, type CrudActionsProps } from "@/shared/ui/crud-actions"

import { config } from "@/shared/config/config"

// Compatibility entry point for existing navigation component tests.
export function CrudActions(props: CrudActionsProps) {
  const currentUser = useCurrentUser()
  const permissions = useNavigationStore(state =>
    Object.values(state.menuIndex).find(entry => entry.menu.id === props.menuId)?.menu.permissions,
  )

  return (
    <CrudPermissionsProvider
      resolvePermissions={() => permissions}
      bypassPermissions={config.app.canBypassCrudPermissions(currentUser.data?.roleId)}
    >
      <SharedCrudActions {...props} />
    </CrudPermissionsProvider>
  )
}
