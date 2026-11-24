import { create } from "zustand"

type SettingsState = {
  primaryColor: string | null
  setPrimaryColor: (color: string) => void
  resetPrimaryColor: () => void
}

const primaryVariables = [
  "--primary",
  "--primary-foreground",
  "--primary-soft",
  "--primary-border",
] as const

function applyPrimaryColor(color: string | null) {
  if (typeof document === "undefined") return

  const style = document.documentElement.style
  if (color === null) {
    primaryVariables.forEach((name) => style.removeProperty(name))
    return
  }

  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(color.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  const foreground = luminance > 0.18 ? "#172033" : "#ffffff"

  style.setProperty("--primary", color)
  style.setProperty("--primary-foreground", foreground)
  style.setProperty("--primary-soft", `color-mix(in oklch, ${color} 20%, white)`)
  style.setProperty("--primary-border", `color-mix(in oklch, ${color} 50%, white)`)
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  primaryColor: null,
  setPrimaryColor: (color) => {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error("primaryColor must be a 6-digit hex color")
    }

    applyPrimaryColor(color)
    set({ primaryColor: color })
  },
  resetPrimaryColor: () => {
    applyPrimaryColor(null)
    set({ primaryColor: null })
  },
}))
