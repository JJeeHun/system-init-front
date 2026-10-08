import type { ReactNode } from "react"

export type SectionTitleProps = {
  children: ReactNode
  as?: "h2" | "h3"
  className?: string
}

export function SectionTitle({
  children,
  as: Heading = "h2",
  className,
}: SectionTitleProps) {
  return (
    <Heading
      className={["text-panel-title font-semibold text-foreground", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Heading>
  )
}
