import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"
import { ErrorState } from "@/shared/ui/error-state"

export function ForbiddenPage() {
  const { t } = useAppTranslation()
  return (
    <PageLayout>
      <ErrorState title={t("auth:forbidden.title")} message={t("auth:forbidden.description")} />
    </PageLayout>
  )
}
