import { House, X } from "lucide-react"
import { Link } from "react-router-dom"

import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/components/ui/button"

type OpenPageTabsProps = {
  tabs: { path: string; label: string }[]
  activePath: string | null
  homePath: string
  homeActive: boolean
  onClose: (path: string) => void
}

export function OpenPageTabs({ tabs, activePath, homePath, homeActive, onClose }: OpenPageTabsProps) {
  const { t } = useAppTranslation()

  return (
    <section
      aria-label={t("navigation:tabs.label")}
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center overflow-hidden border-b border-border bg-card px-2"
    >
      <Link
        to={homePath}
        aria-current={homeActive ? "page" : undefined}
        aria-label={t("navigation:header.homeLink")}
        title={t("navigation:header.homeLink")}
        className={
          "flex h-full w-9 shrink-0 items-center justify-center border-b-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-primary " +
          (homeActive
            ? "border-primary bg-surface-soft text-foreground"
            : "border-transparent text-foreground-soft hover:bg-surface-soft hover:text-foreground")
        }
      >
        <House aria-hidden="true" className="size-4" />
      </Link>
      <span aria-hidden="true" className="mx-1.5 h-5 w-px shrink-0 bg-border-strong" />
      <nav aria-label={t("navigation:tabs.label")} className="flex h-full min-w-0 flex-1 items-stretch gap-0 overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => {
          const active = tab.path === activePath
          return (
            <div
              key={tab.path}
              className={
                "group inline-flex h-full min-w-0 max-w-52 shrink-0 items-center border-b-[3px] transition-colors " +
                (active
                  ? "border-primary bg-surface-soft text-foreground"
                  : "border-transparent text-foreground-soft hover:bg-surface-soft hover:text-foreground")
              }
            >
              <Link
                to={tab.path}
                aria-current={active ? "page" : undefined}
                title={tab.label}
                className={
                  "min-w-0 flex-1 truncate px-2 py-2 text-xs focus-visible:outline-2 focus-visible:outline-primary " +
                  (active ? "font-semibold" : "font-medium")
                }
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
                className="mr-0.5 size-6 shrink-0 rounded-sm text-foreground-soft hover:bg-card hover:text-foreground"
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
