import { z } from "zod"

export const userSearchSchema = z.object({
  keyword: z.string().trim(),
  status: z.enum(["all", "enabled", "disabled"]),
  role: z.string(),
})

export type UserSearchFormValues = z.infer<typeof userSearchSchema>
