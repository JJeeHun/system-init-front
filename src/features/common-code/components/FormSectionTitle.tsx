import type { ReactNode } from "react"

type FormSectionTitleProps = {
  children: ReactNode
}

export function FormSectionTitle({ children }: FormSectionTitleProps) {
  return (
    <h3 className="col-span-full text-sm font-semibold text-foreground">
      {children}
    </h3>
  )
}
