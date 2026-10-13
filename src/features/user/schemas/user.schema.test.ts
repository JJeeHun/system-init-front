import { describe, expect, it } from "vitest"

import { userSchema } from "@/features/user/schemas/user.schema"
import { userSearchSchema } from "@/features/user/schemas/user-search.schema"

const user = { id: "my_user", name: "User", email: "test@example.com", center: "SEOUL", role: "STAFF", enabled: true }

describe("user validation", () => {
  it("accepts valid user input and trims editable text", () => {
    expect(userSchema.parse({ ...user, name: " Name " }).name).toBe("Name")
  })

  it("rejects invalid ID, empty name and invalid email", () => {
    const result = userSchema.safeParse({ ...user, id: "x", name: " ", email: "bad" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.map(issue => issue.path[0])).toEqual(expect.arrayContaining(["id", "name", "email"]))
  })

  it("trims search keyword while retaining search filters", () => {
    expect(userSearchSchema.parse({ keyword: " abc ", status: "all", role: "all" })).toEqual({ keyword: "abc", status: "all", role: "all" })
  })
})
