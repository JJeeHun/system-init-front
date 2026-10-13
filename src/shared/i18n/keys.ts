import auth from "@/shared/i18n/locales/ko/auth.json"
import common from "@/shared/i18n/locales/ko/common.json"
import commonCode from "@/shared/i18n/locales/ko/common-code.json"
import home from "@/shared/i18n/locales/ko/home.json"
import navigation from "@/shared/i18n/locales/ko/navigation.json"
import role from "@/shared/i18n/locales/ko/role.json"
import user from "@/shared/i18n/locales/ko/user.json"

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${NestedKeys<T[K]>}`
      : never
}[keyof T & string]

type TranslationResources = {
  auth: typeof auth
  common: typeof common
  "common-code": typeof commonCode
  home: typeof home
  navigation: typeof navigation
  role: typeof role
  user: typeof user
}

export type TranslationKey = {
  [N in keyof TranslationResources & string]:
    `${N}:${NestedKeys<TranslationResources[N]>}`
}[keyof TranslationResources & string]
