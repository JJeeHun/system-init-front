import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { authMutations } from "@/features/auth/api/auth.query"
import { setAuthSession } from "@/features/auth/storage/auth-session"
import type { LoginRequest } from "@/features/auth/types/auth.types"

export function useLoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
      queryClient.clear()
      navigate("/app", { replace: true })
    },
  })

  const submit = form.handleSubmit((values) => {
    loginMutation.mutate(values)
  })

  return {
    register: form.register,
    submit,
    isPending: loginMutation.isPending,
    errorMessage:
      loginMutation.error instanceof Error ? loginMutation.error.message : null,
  }
}
