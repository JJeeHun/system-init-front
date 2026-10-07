import { Boxes, ChevronDown, MapPin, Menu } from "lucide-react"

import type {
  NavigationMenuItem,
  NavigationUser,
} from "@/features/navigation/types/navigation.types"

type HeaderProps = {
  menus: NavigationMenuItem[]
  user: NavigationUser | null
  activeRootId?: string
  onRootSelect: (menu: NavigationMenuItem) => void
  onOpenSidebar: () => void
}

export function Header({
  menus,
  user,
  activeRootId,
  onRootSelect,
  onOpenSidebar,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] grid min-h-[var(--layout-header-height)] grid-cols-[1fr_auto] bg-header text-header-foreground lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_auto]">
      <div className="flex items-center gap-3 border-b border-header-border px-4 lg:border-b-0 lg:border-r">
        <span className="grid size-9 place-items-center rounded-md bg-header-accent">
          <Boxes aria-hidden="true" className="size-5" />
        </span>
        <span className="grid min-w-0">
          <strong className="truncate text-sm">FlowStock</strong>
          <small className="truncate text-xs uppercase tracking-wider text-header-faint">
            WMS Console
          </small>
        </span>
      </div>

      <nav className="hidden min-w-0 overflow-x-auto lg:flex" aria-label="주요 업무 메뉴">
        {menus.map((menu) => {
          const active = menu.id === activeRootId

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => onRootSelect(menu)}
              className={[
                "min-w-24 border-b-[0.18rem] px-4 text-sm transition-colors",
                active
                  ? "border-header-active bg-header-surface text-header-foreground font-semibold"
                  : "border-transparent text-header-muted hover:bg-header-surface hover:text-header-foreground",
              ].join(" ")}
            >
              {menu.label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 px-3">
        {user ? (
          <span className="hidden items-center gap-2 text-xs text-header-muted xl:inline-flex">
            <MapPin aria-hidden="true" className="size-4" />
            {user.centerName}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onOpenSidebar}
          className="grid size-10 place-items-center rounded-md border border-header-border bg-header-surface text-header-foreground lg:hidden"
          aria-label="사이드 메뉴 열기"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        {user ? (
          <div className="hidden h-10 items-center gap-2 rounded-md border border-header-border bg-header-surface px-3 sm:flex">
            <span className="grid size-7 place-items-center rounded-full bg-header-accent text-xs font-bold">
              {user.name.slice(0, 1)}
            </span>
            <span className="hidden text-left md:grid">
              <strong className="text-xs">{user.name}</strong>
              <small className="text-xs text-header-faint">{user.roleName}</small>
            </span>
            <ChevronDown aria-hidden="true" className="size-4 text-header-muted" />
          </div>
        ) : null}
      </div>
    </header>
  )
}
