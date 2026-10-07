import { LoginForm } from "@/features/auth/components/LoginForm"
import { useLoginForm } from "@/features/auth/hooks/use-login-form"

export function LoginPage() {
  const loginForm = useLoginForm()

  return (
    <LoginForm
      register={loginForm.register}
      onSubmit={loginForm.submit}
      isPending={loginForm.isPending}
      errorMessage={loginForm.errorMessage}
    />
  )
}
