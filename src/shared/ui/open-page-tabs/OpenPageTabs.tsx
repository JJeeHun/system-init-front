import { X } from "lucide-react"
import { Link } from "react-router-dom"

import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/ui/button"

type OpenPageTabsProps = {
  tabs: { path: string; label: string }[]
  activePath: string | null
  onClose: (path: string) => void
}

export function OpenPageTabs({ tabs, activePath, onClose }: OpenPageTabsProps) {
  const { t } = useAppTranslation()

  return (
    <section
      aria-label={t("navigation:tabs.label")}
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b border-border bg-card px-page-x"
    >
      <span className="shrink-0 text-xs font-medium text-foreground-soft">
        {t("navigation:tabs.title")}
      </span>
      <nav aria-label={t("navigation:tabs.label")} className="flex min-w-0 items-center gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.path}
            className={
              "inline-flex shrink-0 items-center rounded-md border " +
              (tab.path === activePath
                ? "border-primary bg-surface-soft text-foreground"
                : "border-border-strong bg-card text-foreground-soft")
            }
          >
            <Link
              to={tab.path}
              aria-current={tab.path === activePath ? "page" : undefined}
              className="max-w-48 truncate px-3 py-2 text-xs font-medium hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {tab.label}
            </Link>
            <Button
              size="sm"
              aria-label={t("navigation:tabs.close", { title: tab.label })}
              onClick={() => onClose(tab.path)}
            >
              <X aria-hidden="true" className="size-3" />
            </Button>
          </div>
        ))}
      </nav>
    </section>
  )
}
