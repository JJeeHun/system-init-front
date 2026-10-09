import type { ButtonHTMLAttributes } from "react"

import { Button as ShadcnButton } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import type { ExclusiveBooleanProps } from "@/shared/types/exclusive-boolean-props"

type ButtonTone = "primary" | "success" | "warning" | "error" | "info" | "header"

export type ButtonSize = "sm" | "md" | "lg"

export type ButtonProps = ExclusiveBooleanProps<ButtonTone> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "color"> & {
    size?: ButtonSize
    loading?: boolean
  }

const shadcnSizeBySize = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const

function resolveTone({
  primary,
  success,
  warning,
  error,
  info,
  header,
}: Pick<ButtonProps, ButtonTone>) {
  if (primary) return "primary"
  if (success) return "success"
  if (warning) return "warning"
  if (error) return "error"
  if (info) return "info"
  if (header) return "header"

  return "neutral"
}

export function Button({
  primary,
  success,
  warning,
  error,
  info,
  header,
  size = "md",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      variant={resolveTone({
        primary,
        success,
        warning,
        error,
        info,
        header,
      })}
      size={shadcnSizeBySize[size]}
    >
      {loading ? <Spinner aria-hidden="true" /> : null}
      {children}
    </ShadcnButton>
  )
}
