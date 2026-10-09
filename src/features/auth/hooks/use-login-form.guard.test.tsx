// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { useLoginForm } from "@/features/auth/hooks/use-login-form"

const loginRequest = vi.hoisted(() => vi.fn())

vi.mock("@/features/auth/api/auth.api", () => ({
  authMutations: {
    login: () => ({ mutationFn: loginRequest }),
  },
}))

function LoginHarness() {
  const login = useLoginForm()
  return (
    <LoginForm
      register={login.register}
      onSubmit={login.submit}
      isPending={login.isPending}
      errorMessage={login.errorMessage}
    />
  )
}

beforeEach(() => {
  loginRequest.mockReset()
})

describe("login pending UX and duplicate request protection", () => {
  it("executes one login on repeated submit, then unlocks and shows an error for retry", async () => {
    let failFirst!: (error: Error) => void
    loginRequest.mockImplementationOnce(
      () => new Promise((_resolve, reject) => { failFirst = reject }),
    )
    loginRequest.mockRejectedValueOnce(new Error("재시도 실패"))

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <LoginHarness />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    const loginButton = screen.getByRole("button", { name: "로그인" })
    fireEvent.click(loginButton)
    fireEvent.click(loginButton)
    await waitFor(() => expect(loginRequest).toHaveBeenCalledTimes(1))
    expect(loginButton).toBeDisabled()
    expect(loginButton).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: /로그인 중/ })).toBeInTheDocument()

    failFirst(new Error("로그인 실패"))
    await screen.findByText("로그인 실패")
    await waitFor(() => expect(loginButton).not.toBeDisabled())

    fireEvent.click(loginButton)
    await waitFor(() => expect(loginRequest).toHaveBeenCalledTimes(2))
    expect(await screen.findByText("재시도 실패")).toBeInTheDocument()
  })
})
