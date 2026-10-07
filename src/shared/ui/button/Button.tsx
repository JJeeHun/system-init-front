import type { ButtonHTMLAttributes } from "react"

import type { ExclusiveBooleanProps } from "@/shared/types/exclusive-boolean-props"

type ButtonTone = "primary" | "success" | "warning" | "error" | "info"

export type ButtonSize = "sm" | "md" | "lg"

export type ButtonProps = ExclusiveBooleanProps<ButtonTone> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "color"> & {
    size?: ButtonSize
  }

const baseClassName =
  "inline-flex items-center justify-center rounded-sm border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"

const toneClassNames = {
  default:
    "border-border-strong bg-card text-foreground hover:bg-surface-soft",
  primary:
    "border-primary bg-primary text-primary-foreground hover:opacity-90",
  success:
    "border-success-border bg-success-soft text-success hover:opacity-90",
  warning:
    "border-warning bg-warning-soft text-warning-foreground hover:opacity-90",
  error:
    "border-destructive bg-destructive-soft text-destructive hover:opacity-90",
  info:
    "border-info-border bg-info-soft text-info hover:opacity-90",
} as const

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-[var(--control-height-sm)] px-3 py-2 text-xs",
  md: "min-h-[var(--control-height-md)] px-4 py-2 text-sm",
  lg: "min-h-[var(--control-height-lg)] px-5 py-2 text-sm",
}

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

  return "default"
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
  const tone = resolveTone({
    primary,
    success,
    warning,
    error,
    info,
  })

  return (
    <button
      {...props}
      type={type}
      className={[
        baseClassName,
        toneClassNames[tone],
        sizeClassNames[size],
      ].join(" ")}
    />
  )
}
