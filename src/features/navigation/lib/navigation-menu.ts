import type { AppTranslate } from "@/shared/i18n"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

function isPathActive(menuPath: string, pathname: string) {
  return pathname === menuPath || pathname.startsWith(menuPath + "/")
}

export function getFirstMenuPath(menu: NavigationMenuItem): string | null {
  if (menu.path) {
    return menu.path
  }

  for (const child of menu.children ?? []) {
    const childPath = getFirstMenuPath(child)

    if (childPath) {
      return childPath
    }
  }

  return null
}

export function findMenuByPath(
  menus: NavigationMenuItem[],
  pathname: string,
): NavigationMenuItem | null {
  for (const menu of menus) {
    if (menu.path && isPathActive(menu.path, pathname)) {
      return menu
    }

    const child = findMenuByPath(menu.children ?? [], pathname)

    if (child) {
      return child
    }
  }

  return null
}

export function findRootMenuByPath(
  menus: NavigationMenuItem[],
  pathname: string,
): NavigationMenuItem | null {
  return (
    menus.find((menu) => {
      if (menu.path && isPathActive(menu.path, pathname)) {
        return true
      }

      return findMenuByPath(menu.children ?? [], pathname) !== null
    }) ?? null
  )
}

export function getMenuLabel(menu: NavigationMenuItem, t: AppTranslate): string {
  if (!menu.labelKey) return menu.label
  const translated = t(menu.labelKey)
  return translated === menu.labelKey ? menu.label : translated
}
