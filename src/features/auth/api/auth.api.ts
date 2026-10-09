import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"
import { mutationOptions } from "@tanstack/react-query"
import { AppError } from "@/shared/lib/app-error"

import type { LoginRequest, LoginResponse } from "@/features/auth/types/auth.types"


export async function login(request: LoginRequest): Promise<LoginResponse> {
  await waitForMockDelay()

  if (!request.username.trim() || !request.password.trim()) {
    throw new AppError("AUTH_CREDENTIALS_REQUIRED", "아이디와 비밀번호를 입력해주세요.")
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
