import { queryOptions } from "@tanstack/react-query"

import { mockNavigationMenus } from "@/features/navigation/api/navigation.mock"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

const MOCK_DELAY = 500

function cloneMenu(menu: NavigationMenuItem): NavigationMenuItem {
  return { ...menu, children: menu.children?.map(cloneMenu) }
}

export async function getNavigationMenus(): Promise<NavigationMenuItem[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
  return mockNavigationMenus.map(cloneMenu)
}

export const navigationQueryKeys = {
  all: ["navigation"] as const,
  menus: () => [...navigationQueryKeys.all, "menus"] as const,
}

export const navigationQueries = {
  menus: () =>
    queryOptions({
      queryKey: navigationQueryKeys.menus(),
      queryFn: getNavigationMenus,
    }),
}
