import { useAppTranslation } from "@/shared/i18n"

import { getFirstMenuPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/ui/button"

type HeaderMenuProps = {
  menus: NavigationMenuItem[]
  loading: boolean
  selectedRootId?: string
  onSelectRoot: (menu: NavigationMenuItem) => void
}

export function HeaderMenu({ menus, loading, selectedRootId, onSelectRoot }: HeaderMenuProps) {
  const { t } = useAppTranslation()

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
        const selected = menu.id === selectedRootId

        return (
          <div
            key={menu.id}
            className={[
              "flex min-w-24 items-center justify-center border-b-2 px-2",
              selected ? "border-header-active bg-header-surface" : "border-transparent",
            ].join(" ")}
          >
            <Button header size="sm" aria-pressed={selected} onClick={() => onSelectRoot(menu)}>
              {getMenuLabel(menu, t)}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
