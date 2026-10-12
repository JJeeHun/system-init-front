import { Boxes } from "lucide-react"
import type { FormEventHandler } from "react"
import type { UseFormRegister } from "react-hook-form"

import type { LoginRequest } from "@/features/auth/types/auth.types"

import { Button } from "@/shared/ui/button"
import { PasswordInput } from "@/shared/ui/password-input"

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

  return (
    <form
      className="w-full rounded-2xl border border-border bg-card p-7 shadow-panel sm:p-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
      onSubmit={onSubmit}
      aria-busy={isPending || undefined}
    >
      <div className="mb-9">
        <div className="mb-9 flex items-center gap-3 lg:hidden">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Boxes aria-hidden="true" className="size-6" />
          </span>
          <div>
            <strong className="block text-lg font-bold tracking-tight text-foreground">FlowStock</strong>
            <span className="text-xs font-medium tracking-wider text-foreground-soft">WMS CONSOLE</span>
          </div>
        </div>
        <p className="text-xs font-semibold tracking-widest text-primary">
          {t("auth:login.welcome")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("auth:login.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-soft">
          {t("auth:login.description")}
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="login-username" className="text-sm font-semibold text-foreground">
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
            className="h-12"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
            {t("auth:login.password")}
          </label>
          <PasswordInput
            id="login-password"
            {...register("password")}
            autoComplete="current-password"
            disabled={isPending}
            placeholder={t("auth:login.passwordPlaceholder")}
            aria-invalid={!!errorMessage || undefined}
            aria-describedby={errorMessage ? "login-error" : undefined}
          />
        </div>

        {errorMessage ? (
          <p id="login-error" role="alert" className="rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-3 grid">
          <Button primary size="lg" type="submit" loading={isPending}>
            {isPending ? t("auth:login.submitting") : t("auth:login.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}
