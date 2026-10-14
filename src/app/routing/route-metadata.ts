import type { ComponentType } from "react"
import { matchPath } from "react-router-dom"

import { CommonCodePage } from "@/pages/CommonCodePage"
import { ForbiddenPage } from "@/pages/ForbiddenPage"
import { HomePage } from "@/pages/HomePage"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { MenuPage } from "@/pages/MenuPage"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { UserManagementPage } from "@/pages/UserManagementPage"

import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { TranslationKey } from "@/shared/i18n/keys"

type MenuDefinition = Omit<MenuRecord, "path" | "labelKey"> & { labelKey: TranslationKey }
type GroupMenu = MenuDefinition & { kind: "group" }
type PageMenu = MenuDefinition & { kind: "page" }

type RoutePage = {
  Component: ComponentType<{ path: string }>
  mode: "tab" | "page"
  titleKey: TranslationKey
  index?: true
} & (
  | { access: "menu"; menu: PageMenu }
  | { access: "public"; menu?: never }
)

type RouteGroup = {
  children: Record<string, RouteDefinition>
  menu?: GroupMenu
  menuGroups?: readonly GroupMenu[]
}

type RouteDefinition = RoutePage | RouteGroup

type MenuDeclaration<Menu, Location extends string> =
  Menu extends { id: infer Id extends string; parentId: infer Parent }
    ? { id: Id; parentId: Parent; location: Location }
    : never

type MenuGroupDeclarations<Groups extends readonly unknown[], Location extends string, Index extends unknown[] = []> =
  Groups extends readonly [infer First, ...infer Rest]
    ? MenuDeclaration<First, `${Location}.menuGroups.${Index["length"]}`>
      | MenuGroupDeclarations<Rest, Location, [...Index, unknown]>
    : never

type MenuNodeDeclarations<Node, Location extends string> =
  | (Node extends { menu: infer Menu } ? MenuDeclaration<Menu, `${Location}.menu`> : never)
  | (Node extends { menuGroups: infer Groups extends readonly unknown[] } ? MenuGroupDeclarations<Groups, Location> : never)
  | (Node extends { children: infer Children } ? MenuDeclarations<Children, Location> : never)

type MenuDeclarations<Nodes, Prefix extends string = ""> = {
  [Key in keyof Nodes & string]: MenuNodeDeclarations<Nodes[Key], `${Prefix}.${Key}`>
}[keyof Nodes & string]

type MenuIds<Nodes> =
  MenuDeclarations<Nodes> extends infer Menu
    ? Menu extends { id: infer Id extends string } ? Id : never
    : never

type MenuParentIds<Nodes> =
  MenuDeclarations<Nodes> extends infer Menu
    ? Menu extends { parentId: infer Parent extends string } ? Parent : never
    : never

type IsUnion<Value, Original = Value> =
  Value extends Original ? [Original] extends [Value] ? false : true : never

type DuplicateMenuIds<Nodes> = {
  [Id in MenuIds<Nodes>]:
    IsUnion<Extract<MenuDeclarations<Nodes>, { id: Id }>["location"]> extends true ? Id : never
}[MenuIds<Nodes>]

type ValidatedMenus<Nodes> =
  ([DuplicateMenuIds<Nodes>] extends [never] ? unknown : { __duplicate_menu_ids__: DuplicateMenuIds<Nodes> }) &
  ([Exclude<MenuParentIds<Nodes>, MenuIds<Nodes>>] extends [never]
    ? unknown
    : { __unknown_menu_parent_ids__: Exclude<MenuParentIds<Nodes>, MenuIds<Nodes>> })

function defineRouteDefinitions<const T extends Record<string, RouteDefinition>>(
  definitions: T & ValidatedMenus<T>,
): T {
  return definitions
}

// A single source of truth: route keys define URL segments; menu hierarchy is independent.
export const routeDefinitions = defineRouteDefinitions({
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
})

type InitializedNode<Node> =
  Node extends { children: infer Children }
    ? Omit<Node, "children" | "menuGroups"> & { readonly path: string } & {
        readonly [Key in keyof Children]: InitializedNode<Children[Key]>
      }
    : Node & { readonly path: string }

type InitializedRoutes = {
  readonly [Key in keyof typeof routeDefinitions]: InitializedNode<(typeof routeDefinitions)[Key]>
}

type ResolvedPage = RoutePage & { readonly path: string }

const pages: ResolvedPage[] = []
const menuDefinitions: MenuRecord[] = []
const menuIds = new Set<string>()
const registeredPaths = new Set<string>()

function registerMenu(menu: MenuDefinition, path: string): void {
  if (menuIds.has(menu.id)) throw new Error(`Duplicate route menu ID: ${menu.id}`)
  menuIds.add(menu.id)
  menuDefinitions.push({ ...menu, path })
}

function initializeNode(key: string, definition: RouteDefinition, parentPath: string): object {
  const segment = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
  const path = "index" in definition && definition.index
    ? parentPath
    : `${parentPath}/${segment}`

  if ("children" in definition) {
    if (definition.menu) registerMenu(definition.menu, "")
    for (const group of definition.menuGroups ?? []) registerMenu(group, "")

    const initialized: Record<string, unknown> = { path }
    for (const [childKey, child] of Object.entries(definition.children)) {
      initialized[childKey] = initializeNode(childKey, child, path)
    }
    return initialized
  }

  if (registeredPaths.has(path)) throw new Error(`Duplicate route path: ${path}`)
  registeredPaths.add(path)
  const page = { ...definition, path }
  pages.push(page)
  if (definition.menu) registerMenu(definition.menu, path)
  return page
}

const initializedRoutes = Object.fromEntries(
  Object.entries(routeDefinitions).map(([key, definition]) => [key, initializeNode(key, definition, "")]),
) as InitializedRoutes

for (const menu of menuDefinitions) {
  if (menu.parentId && !menuIds.has(menu.parentId)) {
    throw new Error(`Missing parent for route menu: ${menu.id}`)
  }
}

export const app = initializedRoutes.app

/** Derived once from routeDefinitions; only menu declarations are generated. */
export const routeMenuDefinitions: readonly MenuRecord[] = menuDefinitions

export function resolveRoute(pathname: string) {
  for (const route of pages) {
    const match = matchPath({ path: route.path, end: true }, pathname)
    if (match) return { path: pathname, route, params: match.params }
  }
  return null
}
