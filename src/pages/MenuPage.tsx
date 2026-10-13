import { useOutletContext } from "react-router-dom"

import { useTabPage } from "@/app/routing/TabPageContext"
import { useAppTranslation } from "@/shared/i18n"

import type { MainLayoutContext } from "@/app/layouts/MainLayout"
import { findMenuByPath, findRootMenuByPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function MenuPage() {
  const { navigation } = useOutletContext<MainLayoutContext>()
  const { t } = useAppTranslation()
  const { path } = useTabPage()
  const currentMenu = findMenuByPath(navigation.menus, path)
  const rootMenu = findRootMenuByPath(navigation.menus, path)

  if (!currentMenu) {
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

  const menuTitle = getMenuLabel(currentMenu, t)

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          {rootMenu ? getMenuLabel(rootMenu, t) : null}
        </p>
        <PageHeader
          title={menuTitle}
          description={t("navigation:page.placeholderDescription")}
        />
      </div>

      <section className="min-w-0 rounded-lg border border-border bg-card p-panel shadow-panel">
        <p className="text-sm font-semibold text-foreground">
          {menuTitle}
        </p>
        <p className="mt-1 text-page-description text-foreground-soft">
          {t("navigation:page.placeholderBody")}
        </p>
      </section>
    </PageLayout>
  )
}
