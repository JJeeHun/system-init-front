import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useState, type FormEventHandler } from "react"
import type { UseFormRegister } from "react-hook-form"

import type { LoginRequest } from "@/features/auth/types/auth.types"

import { Button } from "@/shared/ui/button"

import { useAppTranslation } from "@/shared/i18n"

import { Input } from "@/shared/components/ui/input"

type LoginFormProps = {
  register: UseFormRegister<LoginRequest>
  onSubmit: FormEventHandler<HTMLFormElement>
  isPending: boolean
  errorMessage: string | null
}

export function LoginForm({
  register,
  onSubmit,
  isPending,
  errorMessage,
}: LoginFormProps) {
  const { t } = useAppTranslation()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8"
      onSubmit={onSubmit}
      aria-busy={isPending || undefined}
    >
      <div className="flex items-start gap-3 border-b border-border pb-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0">
          <span className="text-xs font-semibold tracking-wide text-primary">ERP CONSOLE</span>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{t("auth:login.title")}</h1>
          <p className="mt-2 text-sm text-foreground-soft">{t("auth:login.description")}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="login-username" className="text-sm font-medium text-foreground">
            {t("auth:login.username")}
          </label>
          <Input
            id="login-username"
            {...register("username")}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={isPending}
            placeholder={t("auth:login.usernamePlaceholder")}
            aria-invalid={!!errorMessage || undefined}
            aria-describedby={errorMessage ? "login-error" : undefined}
            className="h-11"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            {t("auth:login.password")}
          </label>
          <div className="flex min-w-0 items-center gap-2">
            <Input
              id="login-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              placeholder={t("auth:login.passwordPlaceholder")}
              aria-invalid={!!errorMessage || undefined}
              aria-describedby={errorMessage ? "login-error" : undefined}
              className="h-11"
            />
            <Button
              size="sm"
              type="button"
              disabled={isPending}
              aria-pressed={showPassword}
              aria-label={t(showPassword ? "auth:login.hidePassword" : "auth:login.showPassword")}
              onClick={() => setShowPassword(visible => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {t(showPassword ? "auth:login.hidePassword" : "auth:login.showPassword")}
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <p id="login-error" role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <Button primary size="lg" type="submit" loading={isPending}>
          {isPending ? t("auth:login.submitting") : t("auth:login.submit")}
        </Button>

        <p className="text-center text-xs text-foreground-soft">
          {t("auth:login.sessionNote")}
        </p>
      </div>
    </form>
  )
}
