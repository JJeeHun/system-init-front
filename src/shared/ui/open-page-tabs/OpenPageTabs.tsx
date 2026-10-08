export function OpenPageTabs() {
  return (
    <section
      aria-label="열린 화면 탭 영역"
      className="flex h-[var(--layout-open-tabs-height)] min-w-0 shrink-0 items-center gap-3 overflow-hidden border-b border-border bg-card px-page-x"
    >
      <span className="shrink-0 text-xs font-medium text-foreground-soft">
        열린 화면
      </span>
      <span className="inline-flex min-w-0 items-center rounded-md border border-border-strong bg-surface-soft px-3 py-1 text-xs text-foreground">
        <span className="truncate">화면 탭 미리보기</span>
      </span>
    </section>
  )
}
