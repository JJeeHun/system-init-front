import { Link } from "react-router-dom"
import { useTranslation } from "@/shared/i18n"
import { House, ArrowRight } from "lucide-react"

import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"
import { Panel } from "@/shared/ui/panel"

export function HomePage() {
  const { t } = useTranslation()
  return (
    <PageLayout>
      <PageHeader title={t("home:title")} description={t("home:description")} />
      <Panel>
        <Panel.Header title={t("home:startTitle")} description={t("home:startDescription")} />
        <Panel.Content>
          <Link
            to="/app/master/common-code"
            className="inline-flex min-h-10 items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-primary"
          >
            <House aria-hidden="true" className="size-4 text-primary" />
            {t("home:commonCodeLink")}
            <ArrowRight aria-hidden="true" className="size-4 text-foreground-soft" />
          </Link>
        </Panel.Content>
      </Panel>
    </PageLayout>
  )
}
