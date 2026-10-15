import type { ComponentType } from "react"
import { matchPath } from "react-router-dom"

import { routeDefinitions } from "@/app/routing/route-definitions"


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

type InitializedNode<Node> =
  Node extends { children: infer Children }
    ? Omit<Node, "children" | "menuGroups"> & { readonly path: string } & {
        readonly [Key in keyof Children]: InitializedNode<Children[Key]>
      }
    : Node & { readonly path: string }

type InitializedRoutes = {
  readonly [Key in keyof typeof routeDefinitions]: InitializedNode<(typeof routeDefinitions)[Key]>
}

type ResolvedPage = RoutePage & { readonly id: string; readonly path: string }

const pages: ResolvedPage[] = []
const menuDefinitions: MenuRecord[] = []
const menuIds = new Set<string>()
const registeredPaths = new Set<string>()

function registerMenu(menu: MenuDefinition, path: string): void {
  if (menuIds.has(menu.id)) throw new Error(`Duplicate route menu ID: ${menu.id}`)
  menuIds.add(menu.id)
  menuDefinitions.push({ ...menu, path })
}

function initializeNode(key: string, definition: RouteDefinition, parentPath: string, parentId = ""): object {
  const id = parentId ? `${parentId}.${key}` : key
  const segment = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
  const path = "index" in definition && definition.index
    ? parentPath
    : `${parentPath}/${segment}`

  if ("children" in definition) {
    if (definition.menu) registerMenu(definition.menu, "")
    for (const group of definition.menuGroups ?? []) registerMenu(group, "")

    const initialized: Record<string, unknown> = { path }
    for (const [childKey, child] of Object.entries(definition.children)) {
      initialized[childKey] = initializeNode(childKey, child, path, id)
    }
    return initialized
  }

  if (registeredPaths.has(path)) throw new Error(`Duplicate route path: ${path}`)
  registeredPaths.add(path)
  const page = { ...definition, id, path }
  pages.push(page)
  if (definition.menu) registerMenu(definition.menu, path)
  return page
}

const initializedRoutes = Object.fromEntries(
  Object.entries(defineRouteDefinitions(routeDefinitions)).map(([key, definition]) => [key, initializeNode(key, definition, "")]),
) as InitializedRoutes

for (const menu of menuDefinitions) {
  if (menu.parentId && !menuIds.has(menu.parentId)) {
    throw new Error(`Missing parent for route menu: ${menu.id}`)
  }
}

export { routeDefinitions }

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
