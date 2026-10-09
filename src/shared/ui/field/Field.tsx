import type { ReactNode } from "react"
import { useAppTranslation } from "@/shared/i18n"

import {
  Field as ShadcnField,
  FieldDescription as ShadcnFieldDescription,
  FieldError as ShadcnFieldError,
  FieldLabel as ShadcnFieldLabel,
} from "@/shared/components/ui/field"

export type FieldProps = {
  label: ReactNode
  htmlFor: string
  children: ReactNode
  error?: string | null
  description?: string
  required?: boolean
  orientation?: "vertical" | "horizontal"
  className?: string
}

export function Field({
  label,
  htmlFor,
  children,
  error,
  description,
  required = false,
  orientation = "vertical",
  className,
}: FieldProps) {
  const { t } = useAppTranslation()
  const fieldLabel = (
    <ShadcnFieldLabel htmlFor={htmlFor}>
      {label}
      {required ? (
        <>
          <span aria-hidden="true" className="text-destructive">*</span>
          <span className="sr-only">{t("common:labels.required")}</span>
        </>
      ) : null}
    </ShadcnFieldLabel>
  )

  return (
    <ShadcnField
      orientation={orientation}
      className={className}
      data-invalid={Boolean(error)}
    >
      {orientation === "horizontal" ? children : fieldLabel}
      {orientation === "horizontal" ? fieldLabel : children}
      {description ? <ShadcnFieldDescription id={`${htmlFor}-description`}>{description}</ShadcnFieldDescription> : null}
      {error ? <ShadcnFieldError id={`${htmlFor}-error`}>{error}</ShadcnFieldError> : null}
    </ShadcnField>
  )
}
