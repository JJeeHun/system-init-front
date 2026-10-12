import { useLocation } from "react-router-dom"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { useLoginForm } from "@/features/auth/hooks/use-login-form"
import { useAppTranslation } from "@/shared/i18n"

export function LoginPage() {
  const loginForm = useLoginForm()
  const location = useLocation()
  const { t } = useAppTranslation()
  const reason = (location.state as { reason?: string } | null)?.reason

  return (
    <div className="grid w-full max-w-md gap-3">
      {reason === "expired" || reason === "unauthorized" ? (
        <p role="alert" className="rounded-md border border-border bg-card p-3 text-sm text-foreground">
          {t("auth:session.expired")}
        </p>
      ) : null}
      <LoginForm
        register={loginForm.register}
        onSubmit={loginForm.submit}
        isPending={loginForm.isPending}
        errorMessage={loginForm.errorMessage}
      />
    </div>
  )
}
