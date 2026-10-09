import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { buildVisibleMenus, createMockMenu, deleteMockMenu, getMenuRecordsSnapshot, updateMockMenu } from "@/features/navigation/api/navigation.mock"
import type { MenuInput, MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

const READ_DELAY = 500
const MUTATION_DELAY = 240

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getNavigationMenus(): Promise<NavigationMenuItem[]> {
  await wait(READ_DELAY)
  return buildVisibleMenus()
}

export async function getMenuRecords(): Promise<MenuRecord[]> {
  await wait(READ_DELAY)
  return getMenuRecordsSnapshot()
}

export async function createMenu(input: MenuInput): Promise<MenuRecord> {
  await wait(MUTATION_DELAY)
  return createMockMenu(input)
}

export async function updateMenu(input: { id: string; request: MenuInput }): Promise<MenuRecord> {
  await wait(MUTATION_DELAY)
  return updateMockMenu(input.id, input.request)
}

export async function deleteMenu(id: string): Promise<void> {
  await wait(MUTATION_DELAY)
  deleteMockMenu(id)
}

export const navigationQueryKeys = {
  all: ["navigation"] as const,
  menus: () => [...navigationQueryKeys.all, "menus"] as const,
  management: () => [...navigationQueryKeys.all, "management"] as const,
}

export const navigationQueries = {
  menus: () => queryOptions({ queryKey: navigationQueryKeys.menus(), queryFn: getNavigationMenus }),
  management: () => queryOptions({ queryKey: navigationQueryKeys.management(), queryFn: getMenuRecords }),
}

export const navigationMutations = {
  create: () => mutationOptions({ mutationFn: createMenu, meta: { globalError: true } }),
  update: () => mutationOptions({ mutationFn: updateMenu, meta: { globalError: true } }),
  delete: () => mutationOptions({ mutationFn: deleteMenu, meta: { globalError: true } }),
}
