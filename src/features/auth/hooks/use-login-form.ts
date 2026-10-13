import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { useAppTranslation } from "@/shared/i18n"
import { AppError } from "@/shared/lib/app-error"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"

import { authMutations } from "@/features/auth/api/auth.api"
import { setAuthSession } from "@/features/auth/storage/auth-session"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema"

export function useLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useAppTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin",
    },
  })

  const loginMutation = useMutation({
    ...authMutations.login(),
    onSuccess: ({ accessToken, expiresIn }) => {
      setAuthSession(accessToken, expiresIn)
      queryClient.removeQueries()
      const from = (location.state as { from?: unknown } | null)?.from
      navigate(typeof from === "string" && (from === "/app" || from.startsWith("/app/")) ? from : "/app", { replace: true })
    },
  })

  const submit = form.handleSubmit((values) => {
    runMutation(() => loginMutation.mutateAsync(values))
  })

  return {
    register: form.register,
    submit,
    isPending: loginMutation.isPending,
    errorMessage:
      t(form.formState.errors.username?.message ?? form.formState.errors.password?.message) ||
      (loginMutation.error instanceof AppError && loginMutation.error.code === "AUTH_CREDENTIALS_REQUIRED"
        ? t("auth:validation.credentialsRequired")
        : loginMutation.error instanceof Error ? loginMutation.error.message : null),
  }
}
