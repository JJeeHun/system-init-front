// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { changeLanguage, getLanguage, translate, useAppTranslation } from "@/shared/i18n"

function LanguageProbe() {
  const { t, language, changeLanguage: setLanguage } = useAppTranslation()

  return (
    <div>
      <span>{t("common:actions.save")}</span>
      <span data-testid="language">{language}</span>
      <button type="button" onClick={() => void setLanguage("en")}>English</button>
    </div>
  )
}

afterEach(async () => {
  await act(async () => { await changeLanguage("ko") })
})

describe("application translation facade", () => {
  it("translates outside React using the active language and interpolation", async () => {
    await changeLanguage("ko")
    expect(getLanguage()).toBe("ko")
    expect(translate("common:actions.save")).toBe("저장")
    expect(translate("common-code:group.deleteConfirm", { name: "A" })).toContain("A")

    await changeLanguage("en")
    expect(getLanguage()).toBe("en")
    expect(translate("common:actions.save")).toBe("Save")
    expect(translate("common-code:group.deleteConfirm", { name: "A" })).toBe('Delete the group "A"?')
  })

  it("updates already rendered React content when the public language changer is used", async () => {
    await changeLanguage("ko")
    render(<LanguageProbe />)

    expect(screen.getByText("저장")).toBeInTheDocument()
    await act(async () => {
      screen.getByRole("button", { name: "English" }).click()
    })
    expect(await screen.findByText("Save")).toBeInTheDocument()
    expect(screen.getByTestId("language")).toHaveTextContent("en")
    expect(localStorage.getItem("system-init-front.language")).toBe("en")
    expect(document.documentElement.lang).toBe("en")
  })
})
