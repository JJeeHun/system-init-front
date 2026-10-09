import { waitForMockDelay } from "@/shared/dev-tools/mock-delay"
import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { buildVisibleMenus, createMockMenu, deleteMockMenu, getMenuRecordsSnapshot, updateMockMenu } from "@/features/navigation/api/navigation.mock"
import type { MenuInput, MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"



export async function getNavigationMenus(): Promise<NavigationMenuItem[]> {
  await waitForMockDelay()
  return buildVisibleMenus()
}

export async function getMenuRecords(): Promise<MenuRecord[]> {
  await waitForMockDelay()
  return getMenuRecordsSnapshot()
}

export async function createMenu(input: MenuInput): Promise<MenuRecord> {
  await waitForMockDelay()
  return createMockMenu(input)
}

export async function updateMenu(input: { id: string; request: MenuInput }): Promise<MenuRecord> {
  await waitForMockDelay()
  return updateMockMenu(input.id, input.request)
}

export async function deleteMenu(id: string): Promise<void> {
  await waitForMockDelay()
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
