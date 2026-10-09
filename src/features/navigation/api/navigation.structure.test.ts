import { afterEach, describe, expect, it, vi } from "vitest"

import { getNavigationMenus } from "@/features/navigation/api/navigation.api"
import { findMenuByPath, getFirstMenuPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import koNavigation from "@/shared/i18n/locales/ko/navigation.json"
import enNavigation from "@/shared/i18n/locales/en/navigation.json"

afterEach(() => vi.useRealTimers())

describe("administrator base navigation", () => {
  it("exposes only the four planned system screens grouped by ownership", async () => {
    vi.useFakeTimers()
    const pending = getNavigationMenus()
    await vi.advanceTimersByTimeAsync(500)
    const menus = await pending

    expect(menus).toHaveLength(1)
    const system = menus[0]
    expect(system.id).toBe("system")
    expect(system.labelKey).toBe("navigation:menu.system")
    expect(system.children?.map(group => group.id)).toEqual(["user-access", "system-settings"])
    expect(system.children?.[0].children?.map(item => item.id)).toEqual(["user", "role"])
    expect(system.children?.[1].children?.map(item => item.id)).toEqual(["menu-management", "common-code"])

    expect(getFirstMenuPath(system)).toBe("/app/system/users")
    expect(findMenuByPath(menus, "/app/system/roles")?.id).toBe("role")
    expect(findMenuByPath(menus, "/app/system/menus")?.id).toBe("menu-management")
    expect(findMenuByPath(menus, "/app/master/common-code")?.id).toBe("common-code")
    expect(findMenuByPath(menus, "/app/inbound/plan")).toBeNull()
  })

  it("provides a matching Korean and English label for every menu", async () => {
    vi.useFakeTimers()
    const pending = getNavigationMenus()
    await vi.advanceTimersByTimeAsync(500)
    const menus = await pending
    const ids = (items: typeof menus): string[] => items.flatMap(item => [item.id, ...ids(item.children ?? [])])
    const expected = ids(menus)

    expect(Object.keys(koNavigation.menu).sort()).toEqual([...expected].sort())
    expect(Object.keys(enNavigation.menu).sort()).toEqual([...expected].sort())
  })
  it("translates only explicitly keyed menu labels and falls back to original data labels", () => {
    const local = { id: "custom", label: "Original", labelKey: "navigation:menu.unknown" }
    expect(getMenuLabel(local, (key) => key)).toBe("Original")
    expect(getMenuLabel(local, () => "Translated")).toBe("Translated")
    expect(getMenuLabel({ id: "dynamic", label: "User defined" }, () => "Unexpected")).toBe("User defined")
  })

})
