import { describe, expect, it } from "vitest"

import { loginSchema } from "@/features/auth/schemas/login.schema"

describe("login validation", () => {
  it("accepts credentials without changing a nonblank password", () => {
    expect(loginSchema.parse({ username: " admin ", password: " a b " })).toEqual({ username: "admin", password: " a b " })
  })

  it("blocks blank and whitespace-only credentials", () => {
    const result = loginSchema.safeParse({ username: " ", password: "   " })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.map(issue => issue.message)).toEqual(["auth:validation.credentialsRequired", "auth:validation.credentialsRequired"])
  })
})
