import { z } from "zod"

import type { TranslationKey } from "@/shared/i18n/keys"

export const userSchema = z.object({
  id: z.string().trim()
    .min(1, "user:validation.idRequired" satisfies TranslationKey)
    .regex(/^[a-zA-Z0-9_-]{3,30}$/, "user:validation.idFormat" satisfies TranslationKey),
  name: z.string().trim().min(1, "user:validation.nameRequired" satisfies TranslationKey),
  email: z.string().trim()
    .min(1, "user:validation.emailRequired" satisfies TranslationKey)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "user:validation.emailFormat" satisfies TranslationKey),
  center: z.enum(["SEOUL", "BUSAN"]),
  role: z.string(),
  enabled: z.boolean(),
})

export type UserFormValues = z.infer<typeof userSchema>
