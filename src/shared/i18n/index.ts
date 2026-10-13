import { useTranslation as useI18nextTranslation } from "react-i18next"

import { translationEngine } from "@/shared/i18n/engine"
import type { AppLanguage } from "@/shared/i18n/engine"
import type { TranslationKey } from "@/shared/i18n/keys"

export type { AppLanguage } from "@/shared/i18n/engine"

export type TranslationValues = Record<string, string | number | boolean | undefined>
type CheckedKey<K extends string> = string extends K
  ? K
  : K extends TranslationKey
    ? K
    : never

export type AppTranslate = <K extends string>(
  key: CheckedKey<K> | null | undefined,
  values?: TranslationValues,
) => string

function normalizeLanguage(language: string | undefined): AppLanguage {
  return language === "en" ? "en" : "ko"
}

export function getLanguage(): AppLanguage {
  return normalizeLanguage(translationEngine.resolvedLanguage)
}

export function translate<K extends string>(
  key: CheckedKey<K> | null | undefined,
  values?: TranslationValues,
): string {
  return key ? translationEngine.t(key, values) : ""
}

export async function changeLanguage(language: AppLanguage): Promise<void> {
  await translationEngine.changeLanguage(language)
}

export function useAppTranslation() {
  const { t, i18n } = useI18nextTranslation()
  const appTranslate: AppTranslate = (key, values) =>
    key ? t(key, values) : ""

  return {
    t: appTranslate,
    language: normalizeLanguage(i18n.resolvedLanguage),
    changeLanguage,
  }
}

// Compatibility for existing tests. Application code must use the facade above.
/** @deprecated Use translate, changeLanguage and getLanguage instead. */
export { translationEngine as i18n } from "@/shared/i18n/engine"
/** @deprecated Use useAppTranslation instead. */
export { useTranslation } from "react-i18next"
