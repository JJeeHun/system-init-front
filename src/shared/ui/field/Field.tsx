import type { ReactNode } from "react"

import {
  Field as ShadcnField,
  FieldError as ShadcnFieldError,
  FieldLabel as ShadcnFieldLabel,
} from "@/shared/components/ui/field"

export type FieldProps = {
  label: ReactNode
  htmlFor: string
  children: ReactNode
  error?: string | null
  orientation?: "vertical" | "horizontal"
  className?: string
}

export function Field({
  label,
  htmlFor,
  children,
  error,
  orientation = "vertical",
  className,
}: FieldProps) {
  const fieldLabel = (
    <ShadcnFieldLabel htmlFor={htmlFor}>{label}</ShadcnFieldLabel>
  )

  return (
    <ShadcnField
      orientation={orientation}
      className={className}
      data-invalid={Boolean(error)}
    >
      {orientation === "horizontal" ? children : fieldLabel}
      {orientation === "horizontal" ? fieldLabel : children}
      {error ? <ShadcnFieldError>{error}</ShadcnFieldError> : null}
    </ShadcnField>
  )
}
