import type { ReactNode } from "react"
import { cn } from "cn"

export type FilterBarProps = {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end", className)}>
      {children}
    </div>
  )
}
