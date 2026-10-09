import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

export const mockNavigationMenus: NavigationMenuItem[] = [
  {
    id: "system",
    labelKey: "navigation:menu.system",
    label: "시스템 관리",
    children: [
      {
        id: "user-access",
        labelKey: "navigation:menu.user-access",
        label: "사용자·권한",
        children: [
          {
            id: "user",
            labelKey: "navigation:menu.user",
            label: "사용자 관리",
            path: "/app/system/users",
            icon: "users",
          },
          {
            id: "role",
            labelKey: "navigation:menu.role",
            label: "역할·권한 관리",
            path: "/app/system/roles",
            icon: "settings",
          },
        ],
      },
      {
        id: "system-settings",
        labelKey: "navigation:menu.system-settings",
        label: "시스템 설정",
        children: [
          {
            id: "menu-management",
            labelKey: "navigation:menu.menu-management",
            label: "메뉴 관리",
            path: "/app/system/menus",
            icon: "settings",
          },
          {
            id: "common-code",
            labelKey: "navigation:menu.common-code",
            label: "공통코드 관리",
            path: "/app/master/common-code",
            icon: "code",
          },
        ],
      },
    ],
  },
]

