import type { ReactNode } from "react"

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-panel-title font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 truncate text-xs text-foreground-soft">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {errorMessage ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </header>
  )
}
