import { RoleManagementPanel } from "@/features/role/components/RoleManagementPanel"
import { useRoleManagement } from "@/features/role/hooks/use-role-management"

import { PageHeader } from "@/shared/ui/page-header"

import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"

export function RoleManagementPage() {
  const { t } = useAppTranslation()
  const management = useRoleManagement()

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">{t("role:page.category")}</p>
        <PageHeader title={t("role:page.title")} description={t("role:page.description")} />
      </div>
      <RoleManagementPanel management={management} />
    </PageLayout>
  )
}
