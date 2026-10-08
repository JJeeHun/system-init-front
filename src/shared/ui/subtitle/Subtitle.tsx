import type { ReactNode } from "react"

export type SubtitleProps = {
  children: ReactNode
}

export function Subtitle({ children }: SubtitleProps) {
  return (
    <p className="text-page-description leading-snug text-muted-foreground">
      {children}
    </p>
  )
}
