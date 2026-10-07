import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

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
    if (menu.path === pathname) {
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
      if (menu.path === pathname) {
        return true
      }

      return findMenuByPath(menu.children ?? [], pathname) !== null
    }) ?? null
  )
}

export function getActiveMenuIds(
  menus: NavigationMenuItem[],
  pathname: string,
): Set<string> {
  const activeIds = new Set<string>()

  function visit(menu: NavigationMenuItem): boolean {
    const isDirectMatch = menu.path === pathname
    const hasActiveChild = (menu.children ?? []).some(visit)
    const isActive = isDirectMatch || hasActiveChild

    if (isActive) {
      activeIds.add(menu.id)
    }

    return isActive
  }

  menus.forEach(visit)

  return activeIds
}
