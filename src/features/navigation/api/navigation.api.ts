import { queryOptions } from "@tanstack/react-query"

import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

const MOCK_DELAY = 500

const mockNavigationMenus: NavigationMenuItem[] = [
  {
    id: "system",
    label: "시스템 관리",
    children: [
      {
        id: "user-access",
        label: "사용자·권한",
        children: [
          {
            id: "user",
            label: "사용자 관리",
            path: "/app/system/users",
            icon: "users",
          },
          {
            id: "role",
            label: "역할·권한 관리",
            path: "/app/system/roles",
            icon: "settings",
          },
        ],
      },
      {
        id: "system-settings",
        label: "시스템 설정",
        children: [
          {
            id: "menu-management",
            label: "메뉴 관리",
            path: "/app/system/menus",
            icon: "settings",
          },
          {
            id: "common-code",
            label: "공통코드 관리",
            path: "/app/master/common-code",
            icon: "code",
          },
        ],
      },
    ],
  },
]

function withTranslationKeys(menu: NavigationMenuItem): NavigationMenuItem {
  return { ...menu, labelKey: `navigation:menu.${menu.id}`, children: menu.children?.map(withTranslationKeys) }
}

export async function getNavigationMenus(): Promise<NavigationMenuItem[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))
  return mockNavigationMenus.map(withTranslationKeys)
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
