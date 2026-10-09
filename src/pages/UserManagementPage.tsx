import { UserManagementPanel } from "@/features/user/components/UserManagementPanel"
import { useUserManagement } from "@/features/user/hooks/use-user-management"
import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function UserManagementPage() {
  const { t } = useAppTranslation()
  const management = useUserManagement()
  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          {t("user:page.category")}
        </p>
        <PageHeader title={t("user:page.title")} description={t("user:page.description")} />
      </div>
      <UserManagementPanel management={management} />
    </PageLayout>
  )
}
