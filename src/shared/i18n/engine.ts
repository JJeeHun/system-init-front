import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import koCommon from "@/shared/i18n/locales/ko/common.json"
import enCommon from "@/shared/i18n/locales/en/common.json"
import koAuth from "@/shared/i18n/locales/ko/auth.json"
import enAuth from "@/shared/i18n/locales/en/auth.json"
import koHome from "@/shared/i18n/locales/ko/home.json"
import enHome from "@/shared/i18n/locales/en/home.json"
import koNavigation from "@/shared/i18n/locales/ko/navigation.json"
import enNavigation from "@/shared/i18n/locales/en/navigation.json"
import koCommonCode from "@/shared/i18n/locales/ko/common-code.json"
import enCommonCode from "@/shared/i18n/locales/en/common-code.json"

const LANGUAGE_STORAGE_KEY = "system-init-front.language"
export type AppLanguage = "ko" | "en"

function readLanguage(): AppLanguage {
  if (typeof window === "undefined") return "ko"
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "ko"
  } catch {
    return "ko"
  }
}

export const translationEngine = i18next.createInstance()
void translationEngine.use(initReactI18next).init({
  lng: readLanguage(),
  fallbackLng: "ko",
  supportedLngs: ["ko", "en"],
  defaultNS: "common",
  ns: ["common", "auth", "home", "navigation", "common-code"],
  resources: {
    ko: { common: koCommon, auth: koAuth, home: koHome, navigation: koNavigation, "common-code": koCommonCode },
    en: { common: enCommon, auth: enAuth, home: enHome, navigation: enNavigation, "common-code": enCommonCode },
  },
  interpolation: { escapeValue: false },
  initAsync: false,
  react: { useSuspense: false },
})

translationEngine.on("languageChanged", (language) => {
  if (typeof document !== "undefined") document.documentElement.lang = language
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Persisting the language is optional when storage is unavailable.
    }
  }
})
if (typeof document !== "undefined") document.documentElement.lang = translationEngine.language

