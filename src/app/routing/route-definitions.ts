import { CommonCodePage } from "@/pages/CommonCodePage"
import { ForbiddenPage } from "@/pages/ForbiddenPage"
import { HomePage } from "@/pages/HomePage"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { MenuPage } from "@/pages/MenuPage"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { UserManagementPage } from "@/pages/UserManagementPage"

// A single source of truth: route keys define URL segments; menu hierarchy is independent.
export const routeDefinitions = {
  app: {
    children: {
      home: { index: true, Component: HomePage, mode: "page", access: "public", titleKey: "home:title" },
      forbidden: { Component: ForbiddenPage, mode: "page", access: "public", titleKey: "auth:forbidden.title" },
      system: {
        menu: {
          id: "system", parentId: null, label: "시스템 관리",
          labelKey: "navigation:menu.system", kind: "group", sortOrder: 10,
          enabled: true, scope: "GENERAL",
        },
        menuGroups: [
          {
            id: "user-access", parentId: "system", label: "사용자·권한",
            labelKey: "navigation:menu.user-access", kind: "group", sortOrder: 10,
            enabled: true, scope: "GENERAL",
          },
          {
            id: "system-settings", parentId: "system", label: "시스템 설정",
            labelKey: "navigation:menu.system-settings", kind: "group", sortOrder: 20,
            enabled: true, scope: "GENERAL",
          },
        ],
        children: {
          users: {
            Component: UserManagementPage, mode: "tab", access: "menu", titleKey: "navigation:menu.user",
            menu: {
              id: "user", parentId: "user-access", label: "사용자 관리",
              labelKey: "navigation:menu.user", kind: "page", icon: "users",
              sortOrder: 10, enabled: true, scope: "GENERAL",
            },
          },
          roles: {
            Component: RoleManagementPage, mode: "tab", access: "menu", titleKey: "navigation:menu.role",
            menu: {
              id: "role", parentId: "user-access", label: "역할·권한 관리",
              labelKey: "navigation:menu.role", kind: "page", icon: "settings",
              sortOrder: 20, enabled: true, scope: "GENERAL",
            },
          },
          menus: {
            Component: MenuManagementPage, mode: "tab", access: "menu", titleKey: "navigation:menu.menu-management",
            menu: {
              id: "menu-management", parentId: "system-settings", label: "메뉴 관리",
              labelKey: "navigation:menu.menu-management", kind: "page", icon: "settings",
              sortOrder: 10, enabled: true, scope: "SYSTEM",
            },
          },
        },
      },
      master: {
        children: {
          commonCode: {
            Component: CommonCodePage, mode: "tab", access: "menu", titleKey: "navigation:menu.common-code",
            menu: {
              id: "common-code", parentId: "system-settings", label: "공통코드 관리",
              labelKey: "navigation:menu.common-code", kind: "page", icon: "code",
              sortOrder: 20, enabled: true, scope: "GENERAL",
            },
          },
        },
      },
      dev: {
        children: {
          ui: { Component: UiPlaygroundPage, mode: "tab", access: "public", titleKey: "navigation:tabs.uiPlayground" },
        },
      },
      "*": { Component: MenuPage, mode: "page", access: "public", titleKey: "navigation:page.notFound" },
    },
  },
} as const
