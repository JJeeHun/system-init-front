import { describe, expect, it } from "vitest"

import { commonCodeGroupSchema } from "@/features/common-code/schemas/common-code-group.schema"
import { commonCodeItemSchema } from "@/features/common-code/schemas/common-code-item.schema"

const base = { code: " code ", name: " Name ", description: " note ", enabled: true, sortOrder: 0 }

describe("common code validation", () => {
  it("trims values and accepts valid group and item forms", () => {
    for (const schema of [commonCodeGroupSchema, commonCodeItemSchema]) {
      const parsed = schema.parse(base)
      expect(parsed.code).toBe("code")
      expect(parsed.name).toBe("Name")
      expect(parsed.description).toBe("note")
    }
  })

  it("rejects whitespace-only required values and negative sort order", () => {
    for (const schema of [commonCodeGroupSchema, commonCodeItemSchema]) {
      const result = schema.safeParse({ ...base, code: "   ", name: " ", sortOrder: -1 })
      expect(result.success).toBe(false)
      if (!result.success) expect(result.error.issues.map(issue => issue.path[0])).toEqual(expect.arrayContaining(["code", "name", "sortOrder"]))
    }
  })
})
