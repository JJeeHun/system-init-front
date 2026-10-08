import type { ReactNode } from "react"

export type PageLayoutProps = {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-section px-page-x py-page-y">
      {children}
    </div>
  )
}
