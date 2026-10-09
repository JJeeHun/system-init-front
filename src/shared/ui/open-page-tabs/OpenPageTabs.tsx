import { useTranslation } from "@/shared/i18n"

export function OpenPageTabs() {
  const { t } = useTranslation()
  return (
    <section
      aria-label={t("navigation:tabs.label")}
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b border-border bg-card px-page-x"
    >
      <span className="shrink-0 text-xs font-medium text-foreground-soft">
        {t("navigation:tabs.title")}
      </span>
      <span className="inline-flex min-w-0 items-center rounded-md border border-border-strong bg-surface-soft px-3 py-1 text-xs text-foreground">
        <span className="truncate">{t("navigation:tabs.preview")}</span>
      </span>
    </section>
  )
}
