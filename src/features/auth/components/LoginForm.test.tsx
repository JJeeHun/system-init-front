// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/features/auth/components/LoginForm"
import type { LoginRequest } from "@/features/auth/types/auth.types"

function LoginHarness({ errorMessage = null }: { errorMessage?: string | null }) {
  const { register, handleSubmit } = useForm<LoginRequest>()
  return (
    <LoginForm
      register={register}
      onSubmit={handleSubmit(vi.fn())}
      isPending={false}
      errorMessage={errorMessage}
    />
  )
}

describe("login form", () => {
  it("keeps the password masked until the user enables visibility", () => {
    render(<LoginHarness />)

    const password = screen.getByLabelText("비밀번호")
    expect(password).toHaveAttribute("type", "password")

    fireEvent.click(screen.getByRole("button", { name: "보기" }))
    expect(password).toHaveAttribute("type", "text")

    fireEvent.click(screen.getByRole("button", { name: "숨기기" }))
    expect(password).toHaveAttribute("type", "password")
  })

  it("associates an authentication error with both credential fields", () => {
    render(<LoginHarness errorMessage="로그인 실패" />)

    expect(screen.getByRole("alert")).toHaveTextContent("로그인 실패")
    expect(screen.getByLabelText("아이디")).toHaveAttribute("aria-describedby", "login-error")
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("aria-describedby", "login-error")
  })
})
