import type { ReactNode } from "react"

export type PanelProps = {
  children: ReactNode
}

export type PanelHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  errorMessage?: string | null
}

export type PanelContentProps = {
  children: ReactNode
}

export function Panel({ children }: PanelProps) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-card shadow-panel">
      {children}
    </section>
  )
}

function PanelHeader({ title, description, actions, errorMessage }: PanelHeaderProps) {
  return (
    <header className="border-b border-border p-panel">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <h2 className="text-panel-title font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 truncate text-xs text-foreground-soft">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-nowrap gap-1.5">{actions}</div>
        ) : null}
      </div>
      {errorMessage ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </header>
  )
}

function PanelContent({ children }: PanelContentProps) {
  return <div className="min-w-0 p-panel">{children}</div>
}

Panel.Header = PanelHeader
Panel.Content = PanelContent
