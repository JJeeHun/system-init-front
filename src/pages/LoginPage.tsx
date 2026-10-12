import { AlertCircle } from "lucide-react"
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
    <div className="grid w-full gap-4">
      {reason === "expired" || reason === "unauthorized" ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>{t("auth:session.expired")}</p>
        </div>
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
