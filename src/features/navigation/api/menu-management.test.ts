import { afterEach, describe, expect, it, vi } from "vitest"

import { devSettings } from "@/shared/dev-tools/settings"

import { createMenu, deleteMenu, getMenuRecords, getNavigationMenus, updateMenu } from "@/features/navigation/api/navigation.api"
import { resetMockMenusForTest } from "@/features/navigation/api/navigation.mock"
import { findMenuByPath } from "@/features/navigation/lib/navigation-menu"
import type { MenuInput } from "@/features/navigation/types/menu-management.types"

afterEach(() => {
  resetMockMenusForTest()
  vi.useRealTimers()
})

function sample(overrides: Partial<MenuInput> = {}): MenuInput {
  return {
    id: "my-screen",
    parentId: "system-settings",
    label: "사용자 추가 화면",
    kind: "page",
    path: "/app/system/custom",
    icon: "settings",
    sortOrder: 30,
    enabled: true,
    permissionCode: "menu.custom.read",
    ...overrides,
  }
}

describe("menu management mock contract", () => {
  it("creates and updates navigation items while retaining display metadata", async () => {
    vi.useFakeTimers()
    const creation = createMenu(sample())
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    const created = await creation
    expect(created.permissionCode).toBe("menu.custom.read")

    const firstRead = getNavigationMenus()
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    const visible = await firstRead
    expect(findMenuByPath(visible, "/app/system/custom")?.label).toBe("사용자 추가 화면")

    const update = updateMenu({ id: created.id, request: sample({ label: "새 화면", sortOrder: 5, enabled: false }) })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await update

    const recordsQuery = getMenuRecords()
    const hiddenQuery = getNavigationMenus()
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    expect((await recordsQuery).find(item => item.id === created.id)).toMatchObject({ label: "새 화면", enabled: false, sortOrder: 5 })
    expect(findMenuByPath(await hiddenQuery, "/app/system/custom")).toBeNull()
  })

  it("rejects duplicate IDs, paths, and invalid parents without corrupting the menu tree", async () => {
    vi.useFakeTimers()
    const duplicatedId = createMenu(sample({ id: "user" }))
    const duplicatedIdRejected = expect(duplicatedId).rejects.toMatchObject({ code: "MENU_DUPLICATE_ID" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await duplicatedIdRejected

    const duplicatedPath = createMenu(sample({ path: "/app/system/menus" }))
    const duplicatedPathRejected = expect(duplicatedPath).rejects.toMatchObject({ code: "MENU_DUPLICATE_PATH" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await duplicatedPathRejected

    const invalidParent = createMenu(sample({ parentId: "user" }))
    const invalidParentRejected = expect(invalidParent).rejects.toMatchObject({ code: "MENU_INVALID_PARENT" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await invalidParentRejected

    const query = getMenuRecords()
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    expect(await query).toHaveLength(7)
  })

  it("prevents deleting parents, cycles, and converting parent groups into pages", async () => {
    vi.useFakeTimers()
    const remove = deleteMenu("system-settings")
    const removeRejected = expect(remove).rejects.toMatchObject({ code: "MENU_HAS_CHILDREN" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await removeRejected

    const cycle = updateMenu({ id: "system", request: sample({
      id: "system", label: "시스템 관리", parentId: "system-settings", kind: "group", path: "",
    }) })
    const cycleRejected = expect(cycle).rejects.toMatchObject({ code: "MENU_CYCLE" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await cycleRejected

    const conversion = updateMenu({ id: "system-settings", request: sample({
      id: "system-settings", label: "시스템 설정", parentId: "system", kind: "page",
    }) })
    const conversionRejected = expect(conversion).rejects.toMatchObject({ code: "MENU_HAS_CHILDREN" })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await conversionRejected
  })

  it("keeps all descendants hidden when their parent is disabled and preserves built-in menu labels", async () => {
    vi.useFakeTimers()
    const update = updateMenu({ id: "user-access", request: sample({
      id: "user-access", label: "사용자·권한", parentId: "system", kind: "group", path: "", enabled: false,
    }) })
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    await update

    const read = getNavigationMenus()
    await vi.advanceTimersByTimeAsync(devSettings.mockDelayMs)
    const tree = await read
    expect(findMenuByPath(tree, "/app/system/users")).toBeNull()
    expect(findMenuByPath(tree, "/app/system/menus")?.labelKey).toBe("navigation:menu.menu-management")
  })
})
