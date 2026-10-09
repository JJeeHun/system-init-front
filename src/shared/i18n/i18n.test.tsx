// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { i18n, useTranslation } from "@/shared/i18n"
import koCommon from "@/shared/i18n/locales/ko/common.json"
import enCommon from "@/shared/i18n/locales/en/common.json"
import koNavigation from "@/shared/i18n/locales/ko/navigation.json"
import enNavigation from "@/shared/i18n/locales/en/navigation.json"
import koAuth from "@/shared/i18n/locales/ko/auth.json"
import enAuth from "@/shared/i18n/locales/en/auth.json"
import koHome from "@/shared/i18n/locales/ko/home.json"
import enHome from "@/shared/i18n/locales/en/home.json"
import koCodes from "@/shared/i18n/locales/ko/common-code.json"
import enCodes from "@/shared/i18n/locales/en/common-code.json"

const translations = [[koCommon, enCommon], [koAuth, enAuth], [koNavigation, enNavigation], [koHome, enHome], [koCodes, enCodes]]

function paths(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? prefix + "." + key : key
    return entry && typeof entry === "object" ? paths(entry as Record<string, unknown>, path) : [path]
  }).sort()
}

function Sample() {
  const { t } = useTranslation()
  return <div><span>{t("common:actions.save")}</span><span>{t("auth:login.title")}</span></div>
}

afterEach(async () => {
  await act(async () => { await i18n.changeLanguage("ko") })
})

describe("i18n feature namespace contract", () => {
  it("keeps Korean and English keys aligned in every feature namespace", () => {
    for (const [ko, en] of translations) {
      expect(paths(ko)).toEqual(paths(en))
    }
  })

  it("updates existing React labels immediately after a language change and persists the choice", async () => {
    await act(async () => { await i18n.changeLanguage("ko") })
    render(<Sample />)
    expect(screen.getByText("저장")).toBeInTheDocument()
    await act(async () => { await i18n.changeLanguage("en") })
    expect(screen.getByText("Save")).toBeInTheDocument()
    expect(screen.getByText("Log in")).toBeInTheDocument()
    expect(localStorage.getItem("system-init-front.language")).toBe("en")
    expect(document.documentElement.lang).toBe("en")
  })

  it("falls back to Korean for missing English keys and interpolates dynamic text", () => {
    expect(i18n.t("common:actions.save", { lng: "fr" })).toBe("저장")
    expect(i18n.t("common-code:group.deleteConfirm", { lng: "ko", name: "TEST" })).toContain("TEST")
  })
})
