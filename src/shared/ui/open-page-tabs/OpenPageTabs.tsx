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
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center border-b border-border-strong bg-card px-2"
    >
      <Link
        to={homePath}
        aria-current={homeActive ? "page" : undefined}
        aria-label={t("navigation:header.homeLink")}
        title={t("navigation:header.homeLink")}
        className={
          "relative flex h-full w-9 shrink-0 items-center justify-center text-foreground-soft transition-colors after:pointer-events-none after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:rounded-t-sm after:content-[''] focus-visible:outline-2 focus-visible:outline-primary " +
          (homeActive
            ? "bg-primary-soft text-primary after:bg-primary"
            : "hover:bg-primary-soft hover:text-primary hover:after:bg-primary/60")
        }
      >
        <House aria-hidden="true" className="size-4" />
      </Link>
      <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border-strong" />
      <nav
        aria-label={t("navigation:tabs.label")}
        className="flex h-full min-w-0 flex-1 items-stretch gap-0 overflow-x-auto overflow-y-hidden"
      >
        {tabs.map((tab) => {
          const active = tab.path === activePath
          return (
            <div
              key={tab.path}
              className={
                "group relative flex h-full max-w-52 shrink-0 items-center transition-colors after:pointer-events-none after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:rounded-t-sm after:content-[''] " +
                (active
                  ? "bg-primary-soft text-primary after:bg-primary"
                  : "text-foreground-soft hover:bg-primary-soft hover:text-primary hover:after:bg-primary/60")
              }
            >
              <Link
                to={tab.path}
                aria-current={active ? "page" : undefined}
                title={tab.label}
                className={
                  "flex h-full min-w-0 items-center truncate pl-2.5 pr-7 text-xs focus-visible:outline-2 focus-visible:outline-primary " +
                  (active ? "font-semibold" : "font-medium")
                }
              >
                <span className="truncate">{tab.label}</span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("navigation:tabs.close", { title: tab.label })}
                title={t("navigation:tabs.close", { title: tab.label })}
                onClick={() => onClose(tab.path)}
                className="absolute right-0.5 top-1/2 z-10 size-6 -translate-y-1/2 rounded-sm text-foreground-soft opacity-100 transition-opacity hover:bg-card hover:text-foreground focus-visible:opacity-100 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100"
              >
                <X aria-hidden="true" className="size-3.5" />
              </Button>
            </div>
          )
        })}
      </nav>
    </section>
  )
}
