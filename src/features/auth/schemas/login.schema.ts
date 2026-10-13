import { z } from "zod"

import type { TranslationKey } from "@/shared/i18n/keys"

export const loginSchema = z.object({
  username: z.string().trim().min(1, "auth:validation.credentialsRequired" satisfies TranslationKey),
  password: z.string().refine(
    value => value.trim().length > 0,
    "auth:validation.credentialsRequired" satisfies TranslationKey,
  ),
})

export type LoginFormValues = z.infer<typeof loginSchema>
