import { z } from "zod"

import type { TranslationKey } from "@/shared/i18n/keys"

export const roleSchema = z.object({
  id: z.string().trim()
    .min(1, "role:validation.idRequired" satisfies TranslationKey)
    .regex(/^[A-Z][A-Z0-9_]{1,29}$/, "role:validation.idFormat" satisfies TranslationKey),
  name: z.string().trim().min(1, "role:validation.nameRequired" satisfies TranslationKey),
  description: z.string().trim(),
})

export type RoleFormValues = z.infer<typeof roleSchema>
