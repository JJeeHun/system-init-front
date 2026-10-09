import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "@/shared/i18n"
import { useMutationLock } from "@/shared/hooks/use-mutation-lock"

import { authMutations } from "@/features/auth/api/auth.api"
import { setAuthSession } from "@/features/auth/storage/auth-session"
import type { LoginRequest } from "@/features/auth/types/auth.types"

export function useLoginForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const runMutation = useMutationLock()

  const form = useForm<LoginRequest>({
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
      navigate("/app", { replace: true })
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
      loginMutation.error instanceof Error ? t("auth:validation.credentialsRequired") : null,
  }
}
