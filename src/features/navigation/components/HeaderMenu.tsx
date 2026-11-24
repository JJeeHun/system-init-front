import { useAppTranslation } from "@/shared/i18n"

import { useSelectedRootMenu } from "@/features/navigation/hooks/use-selected-root-menu"

import { getFirstMenuPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/ui/button"

type HeaderMenuProps = {
  menus: NavigationMenuItem[]
  loading: boolean
}

export function HeaderMenu({ menus, loading }: HeaderMenuProps) {
  const { t } = useAppTranslation()
  const { selectedRootMenu, selectRootMenu } = useSelectedRootMenu(menus)

  return (
    <nav className="hidden min-w-0 overflow-x-auto lg:flex" aria-label={t("navigation:header.primaryMenu")}>
      {loading ? (
        <div role="status" aria-label={t("navigation:header.menuLoading")} className="flex items-center gap-4 px-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-20 bg-header-surface-hover" />
          ))}
        </div>
      ) : menus.map((menu) => {
        if (!getFirstMenuPath(menu)) return null
        const selected = menu.id === selectedRootMenu?.id

        return (
          <div
            key={menu.id}
            className={[
              "flex min-w-24 items-center justify-center border-b-2 px-2",
              selected ? "border-header-active bg-header-surface" : "border-transparent",
            ].join(" ")}
          >
            <Button header size="sm" aria-pressed={selected} onClick={() => selectRootMenu(menu.id)}>
              {getMenuLabel(menu, t)}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
