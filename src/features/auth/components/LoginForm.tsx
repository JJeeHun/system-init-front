import type { FormEventHandler } from "react"
import { useTranslation } from "@/shared/i18n"
import type { UseFormRegister } from "react-hook-form"

import type { LoginRequest } from "@/features/auth/types/auth.types"
import { Button } from "@/shared/ui/button"

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
  const { t } = useTranslation()
  return (
    <form
      className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold tracking-wide text-primary">
          ERP CONSOLE
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("auth:login.title")}</h1>
        <p className="mt-2 text-sm text-foreground-soft">
          {t("auth:login.description")}
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">{t("auth:login.username")}</span>
          <input
            {...register("username")}
            autoComplete="username"
            className="h-[var(--control-height-md)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">{t("auth:login.password")}</span>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className="h-[var(--control-height-md)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground outline-none"
          />
        </label>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <div className="mt-2 grid">
          <Button primary type="submit" loading={isPending}>
            {isPending ? t("auth:login.submitting") : t("auth:login.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}
