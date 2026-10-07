import type { FormEventHandler } from "react"
import type { UseFormRegister } from "react-hook-form"

import type { LoginRequest } from "@/features/auth/types/auth.types"

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
  return (
    <form
      className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="mb-8">
        <div className="mb-2 text-sm font-semibold tracking-wide text-primary">
          ERP CONSOLE
        </div>
        <h1 className="text-2xl font-bold text-foreground">로그인</h1>
        <p className="mt-2 text-sm text-foreground-soft">
          Mock 인증 후 권한 메뉴를 비동기로 조회합니다.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">아이디</span>
          <input
            {...register("username")}
            autoComplete="username"
            className="h-[var(--control-height-md)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">비밀번호</span>
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

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 inline-flex h-[var(--control-height-md)] items-center justify-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </form>
  )
}
