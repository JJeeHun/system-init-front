import { queryOptions } from "@tanstack/react-query"

import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

const MOCK_DELAY = 1000

const mockNavigationMenus: NavigationMenuItem[] = [
  {
    id: "master",
    label: "기준정보",
    children: [
      {
        id: "master-base",
        label: "기준정보",
        children: [
          {
            id: "common-code",
            label: "공통코드",
            path: "/app/master/common-code",
            icon: "code",
          },
          {
            id: "item",
            label: "품목관리",
            path: "/app/master/item",
            icon: "package",
          },
          {
            id: "user",
            label: "사용자관리",
            path: "/app/master/user",
            icon: "users",
          },
        ],
      },
    ],
  },
  {
    id: "inbound",
    label: "입고관리",
    children: [
      {
        id: "inbound-work",
        label: "입고 업무",
        children: [
          {
            id: "inbound-plan",
            label: "입고예정",
            path: "/app/inbound/plan",
            icon: "calendar",
          },
          {
            id: "inbound-receipt",
            label: "입고처리",
            path: "/app/inbound/receipt",
            icon: "receipt",
          },
        ],
      },
    ],
  },
  {
    id: "outbound",
    label: "출고관리",
    children: [
      {
        id: "outbound-work",
        label: "출고 업무",
        children: [
          {
            id: "outbound-order",
            label: "출고지시",
            path: "/app/outbound/order",
            icon: "clipboard",
          },
          {
            id: "outbound-shipping",
            label: "출고처리",
            path: "/app/outbound/shipping",
            icon: "truck",
          },
        ],
      },
    ],
  },
  {
    id: "inventory",
    label: "재고관리",
    children: [
      {
        id: "inventory-dashboard",
        label: "대시보드",
        children: [
          {
            id: "operations-dashboard",
            label: "운영 대시보드",
            path: "/app/inventory/dashboard",
            icon: "dashboard",
          },
          {
            id: "operations-monitoring",
            label: "운영 모니터링",
            path: "/app/inventory/monitoring",
            icon: "activity",
          },
        ],
      },
      {
        id: "inventory-search",
        label: "재고 조회",
        children: [
          {
            id: "inventory-status",
            label: "재고현황",
            path: "/app/inventory/status",
            icon: "package",
          },
          {
            id: "inventory-lot",
            label: "LOT별 재고",
            path: "/app/inventory/lot",
            icon: "scan",
          },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "운영관리",
    children: [
      {
        id: "operations-system",
        label: "운영 설정",
        children: [
          {
            id: "operations-center",
            label: "센터 운영설정",
            path: "/app/operations/center",
            icon: "settings",
          },
          {
            id: "operations-log",
            label: "작업 이력",
            path: "/app/operations/log",
            icon: "clipboard",
          },
          {
            id: "ui-playground",
            label: "UI Playground",
            path: "/app/dev/ui",
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
