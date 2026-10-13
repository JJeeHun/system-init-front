import { z } from "zod"

import type { TranslationKey } from "@/shared/i18n/keys"

export const commonCodeItemSchema = z.object({
  code: z.string().trim().min(1, "common-code:validation.itemCodeRequired" satisfies TranslationKey),
  name: z.string().trim().min(1, "common-code:validation.itemNameRequired" satisfies TranslationKey),
  description: z.string().trim(),
  enabled: z.boolean(),
  sortOrder: z.number({ error: "common-code:validation.sortOrderRequired" satisfies TranslationKey })
    .min(0, "common-code:validation.sortOrderMin" satisfies TranslationKey),
})

export type CommonCodeItemFormValues = z.infer<typeof commonCodeItemSchema>
