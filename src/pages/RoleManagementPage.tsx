import { useNavigationStore } from "@/app/navigation/use-navigation-store"

import { RoleManagementPanel } from "@/features/role/components/RoleManagementPanel"
import { useRoleManagement } from "@/features/role/hooks/use-role-management"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"

import { CrudPermissionsProvider } from "@/shared/ui/crud-actions"
import { PageHeader } from "@/shared/ui/page-header"

import { config } from "@/shared/config/config"
import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"

export function RoleManagementPage() {
  const { t } = useAppTranslation()
  const management = useRoleManagement()
  const currentUser = useCurrentUser()
  const menuIndex = useNavigationStore(state => state.menuIndex)

  return (
    <CrudPermissionsProvider
      resolvePermissions={menuId => Object.values(menuIndex).find(entry => entry.menu.id === menuId)?.menu.permissions}
      bypassPermissions={config.app.canBypassCrudPermissions(currentUser.data?.roleId)}
    >
      <PageLayout>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">{t("role:page.category")}</p>
          <PageHeader title={t("role:page.title")} description={t("role:page.description")} />
        </div>
        <RoleManagementPanel management={management} />
      </PageLayout>
    </CrudPermissionsProvider>
  )
}
