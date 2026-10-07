import { mutationOptions } from "@tanstack/react-query"

import { login } from "@/features/auth/api/auth.api"

export const authMutations = {
  login: () =>
    mutationOptions({
      mutationFn: login,
    }),
}
