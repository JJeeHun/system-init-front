import type { ButtonHTMLAttributes } from "react"

import { Button as ShadcnButton } from "@/shared/components/ui/button"
import type { ExclusiveBooleanProps } from "@/shared/types/exclusive-boolean-props"

type ButtonTone = "primary" | "success" | "warning" | "error" | "info"

export type ButtonSize = "sm" | "md" | "lg"

export type ButtonProps = ExclusiveBooleanProps<ButtonTone> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "color"> & {
    size?: ButtonSize
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
}: Pick<ButtonProps, ButtonTone>) {
  if (primary) return "primary"
  if (success) return "success"
  if (warning) return "warning"
  if (error) return "error"
  if (info) return "info"

  return "neutral"
}

export function Button({
  primary,
  success,
  warning,
  error,
  info,
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      {...props}
      type={type}
      variant={resolveTone({
        primary,
        success,
        warning,
        error,
        info,
      })}
      size={shadcnSizeBySize[size]}
    />
  )
}
