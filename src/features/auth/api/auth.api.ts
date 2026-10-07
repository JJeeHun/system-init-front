import { mutationOptions } from "@tanstack/react-query"

import type { LoginRequest, LoginResponse } from "@/features/auth/types/auth.types"

const MOCK_DELAY = 350

export async function login(request: LoginRequest): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))

  if (!request.username.trim() || !request.password.trim()) {
    throw new Error("아이디와 비밀번호를 입력해주세요.")
  }

  return {
    accessToken: "mock-access-token",
    expiresIn: 60 * 60,
  }
}

export const authMutations = {
  login: () =>
    mutationOptions({
      mutationFn: login,
    }),
}
