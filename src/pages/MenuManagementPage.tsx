import { MenuManagementPanel } from "@/features/navigation/components/MenuManagementPanel"
import { useMenuManagement } from "@/features/navigation/hooks/use-menu-management"
import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function MenuManagementPage() {
  const { t } = useAppTranslation()
  const management = useMenuManagement()

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          {t("navigation:management.category")}
        </p>
        <PageHeader
          title={t("navigation:management.pageTitle")}
          description={t("navigation:management.pageDescription")}
        />
      </div>
      <MenuManagementPanel management={management} />
    </PageLayout>
  )
}
