import { House, X } from "lucide-react"
import { Link } from "react-router-dom"

import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/components/ui/button"

type OpenPageTabsProps = {
  tabs: { path: string; label: string }[]
  activePath: string | null
  homePath: string
  onClose: (path: string) => void
}

export function OpenPageTabs({ tabs, activePath, homePath, onClose }: OpenPageTabsProps) {
  const { t } = useAppTranslation()

  return (
    <section
      aria-label={t("navigation:tabs.label")}
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center overflow-hidden border-b border-border bg-surface-soft px-2"
    >
      <Link
        to={homePath}
        aria-label={t("navigation:header.homeLink")}
        title={t("navigation:header.homeLink")}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <House aria-hidden="true" className="size-4" />
      </Link>
      <span aria-hidden="true" className="mx-2 h-5 w-px shrink-0 bg-border-strong" />
      <nav aria-label={t("navigation:tabs.label")} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden py-1">
        {tabs.map((tab) => {
          const active = tab.path === activePath
          return (
            <div
              key={tab.path}
              className={
                "group inline-flex h-9 min-w-0 max-w-56 shrink-0 items-center rounded-md border transition-colors " +
                (active
                  ? "border-primary/40 bg-card text-foreground shadow-sm"
                  : "border-transparent text-foreground-soft hover:border-border hover:bg-card/70 hover:text-foreground")
              }
            >
              <Link
                to={tab.path}
                aria-current={active ? "page" : undefined}
                title={tab.label}
                className="min-w-0 flex-1 truncate py-2 pl-3 pr-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary"
              >
                {tab.label}
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                aria-label={t("navigation:tabs.close", { title: tab.label })}
                title={t("navigation:tabs.close", { title: tab.label })}
                onClick={() => onClose(tab.path)}
                className="mr-1 size-6 shrink-0 rounded-sm text-foreground-soft opacity-70 hover:bg-surface-soft hover:text-foreground focus-visible:opacity-100"
              >
                <X aria-hidden="true" className="size-3" />
              </Button>
            </div>
          )
        })}
      </nav>
    </section>
  )
}
