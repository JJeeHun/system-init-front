import type { ButtonHTMLAttributes } from "react"

export type ButtonVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"

export type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseClassName =
  "inline-flex items-center justify-center rounded-sm border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"

const variantClassNames: Record<ButtonVariant, string> = {
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
}

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-[var(--control-height-sm)] px-3 text-xs",
  md: "h-[var(--control-height-md)] px-4 text-sm",
  lg: "h-[var(--control-height-lg)] px-5 text-sm",
}

export function Button({
  variant = "default",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        baseClassName,
        variantClassNames[variant],
        sizeClassNames[size],
      ].join(" ")}
    />
  )
}
