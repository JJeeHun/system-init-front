import { z } from "zod"

import type { TranslationKey } from "@/shared/i18n/keys"

const pagePath = /^\/app\/[^?#]+$/

export const menuSchema = z.object({
  id: z.string().trim()
    .min(1, "navigation:management.validation.idRequired" satisfies TranslationKey)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "navigation:management.validation.idFormat" satisfies TranslationKey),
  label: z.string().trim().min(1, "navigation:management.validation.nameRequired" satisfies TranslationKey),
  parentId: z.string().nullable(),
  kind: z.enum(["group", "page"]),
  path: z.string().trim(),
  icon: z.enum(["activity", "boxes", "calendar", "clipboard", "code", "dashboard", "package", "receipt", "scan", "settings", "truck", "users"]).optional(),
  sortOrder: z.number({ error: "navigation:management.validation.orderRequired" satisfies TranslationKey })
    .int("navigation:management.validation.orderInvalid" satisfies TranslationKey)
    .min(0, "navigation:management.validation.orderInvalid" satisfies TranslationKey),
  enabled: z.boolean(),
  scope: z.enum(["SYSTEM", "GENERAL"]),
}).superRefine((values, ctx) => {
  if (values.kind !== "page") return
  if (values.path.length === 0) {
    ctx.addIssue({ code: "custom", path: ["path"], message: "navigation:management.validation.pathRequired" satisfies TranslationKey })
  } else if (!pagePath.test(values.path)) {
    ctx.addIssue({ code: "custom", path: ["path"], message: "navigation:management.validation.pathFormat" satisfies TranslationKey })
  }
})

export type MenuFormValues = z.infer<typeof menuSchema>
