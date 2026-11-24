// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  changeLanguage,
  formatCurrency,
  formatDate,
  formatNumber,
  getLanguage,
  translate,
  useAppTranslation,
} from "@/shared/i18n"
import { translationEngine } from "@/shared/i18n/engine"

const namespaces = ["common", "auth", "home", "navigation", "common-code", "user", "role"] as const

function flattenTranslations(value: unknown, prefix = ""): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid translation section: ${prefix}`)
  }

  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof entry === "string"
      ? [[path, entry]]
      : Object.entries(flattenTranslations(entry, path))
  }))
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]).sort()
}

function LanguageProbe() {
  const { t, language, changeLanguage: setLanguage } = useAppTranslation()
  return (
    <button type="button" onClick={() => void setLanguage(language === "ko" ? "en" : "ko")}>
      {t("common:actions.save")}
    </button>
  )
}

afterEach(async () => {
  cleanup()
  await changeLanguage("ko")
  window.localStorage.removeItem("system-init-front.language")
})

describe("i18n locale contract", () => {
  it("keeps Korean and English keys and interpolation variables aligned", () => {
    for (const namespace of namespaces) {
      const ko = flattenTranslations(translationEngine.getResourceBundle("ko", namespace))
      const en = flattenTranslations(translationEngine.getResourceBundle("en", namespace))

      expect(Object.keys(ko).length).toBeGreaterThan(0)
      expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort())
      for (const key of Object.keys(ko)) {
        expect(ko[key].trim()).not.toBe("")
        expect(en[key].trim()).not.toBe("")
        expect(placeholders(en[key])).toEqual(placeholders(ko[key]))
      }
    }
  })

  it("falls back to Korean when the English translation is missing", async () => {
    translationEngine.addResourceBundle("ko", "contract-fallback", { message: "한국어 대체 문구" })
    try {
      await changeLanguage("en")
      const key: string = "contract-fallback:message"
      expect(translate(key)).toBe("한국어 대체 문구")
    } finally {
      translationEngine.removeResourceBundle("ko", "contract-fallback")
    }
  })

  it("formats dates, numbers, and currencies using the active language", async () => {
    const date = new Date("2026-10-20T00:00:00.000Z")
    const options: Intl.DateTimeFormatOptions = { dateStyle: "long", timeZone: "UTC" }
    const amount = 12345.67
    const numberOptions: Intl.NumberFormatOptions = { maximumFractionDigits: 1 }

    for (const language of ["ko", "en"] as const) {
      await changeLanguage(language)
      expect(getLanguage()).toBe(language)
      expect(formatDate(date, options)).toBe(new Intl.DateTimeFormat(language, options).format(date))
      expect(formatNumber(amount, numberOptions)).toBe(new Intl.NumberFormat(language, numberOptions).format(amount))
      expect(formatCurrency(amount, "USD")).toBe(new Intl.NumberFormat(language, {
        style: "currency", currency: "USD",
      }).format(amount))
    }
  })

  it("updates translated UI text and saved language when language changes", async () => {
    await changeLanguage("ko")
    render(<LanguageProbe />)
    expect(screen.getByRole("button", { name: "저장" })).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }))
    })

    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy()
    expect(document.documentElement.lang).toBe("en")
    expect(window.localStorage.getItem("system-init-front.language")).toBe("en")
    expect(translate("common:validation.required", { field: "Name" })).toBe("Please enter Name.")
  })
})
