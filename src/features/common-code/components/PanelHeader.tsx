import type { ReactNode } from "react"

import { SectionTitle } from "@/shared/ui/section-title"

type PanelHeaderProps = {
  title: string
  description?: ReactNode
  actions: ReactNode
  errorMessage?: string | null
}

export function PanelHeader({
  title,
  description,
  actions,
  errorMessage,
}: PanelHeaderProps) {
  return (
    <header className="border-b border-border p-panel">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <SectionTitle>{title}</SectionTitle>
          {description ? (
            <p className="mt-1 truncate text-xs text-foreground-soft">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-nowrap gap-1.5">{actions}</div>
      </div>
      {errorMessage ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </header>
  )
}
