import { useOutletContext } from "react-router-dom"
import { useTranslation } from "@/shared/i18n"

import type { MainLayoutContext } from "@/app/layouts/MainLayout"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function MenuPage() {
  const { navigation } = useOutletContext<MainLayoutContext>()
  const { t } = useTranslation()

  if (!navigation.currentMenu) {
    return (
      <PageLayout>
        <section className="min-w-0 rounded-lg border border-border bg-card p-panel shadow-panel">
          <PageHeader
            title={t("navigation:page.notFound")}
            description={t("navigation:page.notFoundDescription")}
          />
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          {navigation.activeRootMenu?.labelKey ? t(navigation.activeRootMenu.labelKey) : navigation.activeRootMenu?.label}
        </p>
        <PageHeader
          title={navigation.currentMenu.labelKey ? t(navigation.currentMenu.labelKey) : navigation.currentMenu.label}
          description={t("navigation:page.placeholderDescription")}
        />
      </div>

      <section className="min-w-0 rounded-lg border border-border bg-card p-panel shadow-panel">
        <p className="text-sm font-semibold text-foreground">
          {navigation.currentMenu.labelKey ? t(navigation.currentMenu.labelKey) : navigation.currentMenu.label}
        </p>
        <p className="mt-1 text-page-description text-foreground-soft">
          {t("navigation:page.placeholderBody")}
        </p>
      </section>
    </PageLayout>
  )
}
