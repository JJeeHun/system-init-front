import { z } from "zod"

export const roleSearchSchema = z.object({ keyword: z.string().trim() })

export type RoleSearchFormValues = z.infer<typeof roleSearchSchema>
