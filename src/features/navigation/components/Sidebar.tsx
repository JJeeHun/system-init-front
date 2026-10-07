import { X } from "lucide-react"
import { NavLink } from "react-router-dom"

import { MenuIcon } from "@/features/navigation/components/MenuIcon"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"

type SidebarProps = {
  title: string
  rootMenus: NavigationMenuItem[]
  activeRootId?: string
  menus: NavigationMenuItem[]
  activeMenuIds: Set<string>
  open: boolean
  onRootSelect: (menu: NavigationMenuItem) => void
  onClose: () => void
}

type SidebarItemsProps = {
  menus: NavigationMenuItem[]
  activeMenuIds: Set<string>
  depth?: number
}

function SidebarItems({
  menus,
  activeMenuIds,
  depth = 0,
}: SidebarItemsProps) {
  return (
    <>
      {menus.map((menu) => {
        const children = menu.children ?? []

        if (children.length > 0) {
          return (
            <section
              key={menu.id}
              className={depth === 0 ? "mt-5 first:mt-0" : "mt-3"}
            >
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-foreground-faint">
                {menu.label}
              </p>
              <div className="grid gap-1">
                <SidebarItems
                  menus={children}
                  activeMenuIds={activeMenuIds}
                  depth={depth + 1}
                />
              </div>
            </section>
          )
        }

        if (!menu.path) {
          return null
        }

        const active = activeMenuIds.has(menu.id)

        return (
          <NavLink
            key={menu.id}
            to={menu.path}
            className={[
              "flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors",
              active
                ? "bg-sidebar-active font-semibold text-sidebar-active-foreground"
                : "text-sidebar-foreground hover:bg-surface-soft hover:text-foreground",
            ].join(" ")}
          >
            <MenuIcon name={menu.icon} />
            <span className="truncate">{menu.label}</span>
          </NavLink>
        )
      })}
    </>
  )
}

export function Sidebar({
  title,
  rootMenus,
  activeRootId,
  menus,
  activeMenuIds,
  open,
  onRootSelect,
  onClose,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="사이드 메뉴 닫기"
        onClick={onClose}
        data-open={open}
        className="fixed inset-x-0 bottom-0 top-[var(--layout-header-height)] z-[var(--z-backdrop)] hidden bg-backdrop data-[open=true]:block lg:hidden"
      />

      <aside
        data-open={open}
        className="fixed bottom-0 left-0 top-[var(--layout-header-height)] z-[var(--z-sidebar)] w-[var(--layout-sidebar-mobile-width)] -translate-x-full overflow-y-auto border-r border-border bg-sidebar shadow-drawer transition-transform duration-200 data-[open=true]:translate-x-0 lg:sticky lg:top-[var(--layout-header-height)] lg:h-[calc(100dvh-var(--layout-header-height))] lg:w-auto lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-4">
          <strong className="text-sm text-foreground">{title}</strong>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-sm text-foreground-soft hover:bg-surface-soft lg:hidden"
            aria-label="사이드 메뉴 닫기"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <nav className="border-b border-border p-3 lg:hidden" aria-label="주요 업무 메뉴">
          <div className="grid grid-cols-2 gap-2">
            {rootMenus.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => onRootSelect(menu)}
                className={[
                  "min-h-10 rounded-sm px-3 text-left text-sm",
                  menu.id === activeRootId
                    ? "bg-primary-soft font-semibold text-primary"
                    : "bg-surface-soft text-foreground-soft",
                ].join(" ")}
              >
                {menu.label}
              </button>
            ))}
          </div>
        </nav>

        <nav className="p-3" aria-label={title + " 하위 메뉴"}>
          <SidebarItems menus={menus} activeMenuIds={activeMenuIds} />
        </nav>
      </aside>
    </>
  )
}
