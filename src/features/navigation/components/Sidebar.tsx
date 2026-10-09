import { memo, useEffect } from "react"
import { House, X } from "lucide-react"
import { NavLink } from "react-router-dom"

import { MenuIcon } from "@/features/navigation/components/MenuIcon"
import { getFirstMenuPath } from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/ui/button"

type SidebarProps = {
  title: string
  rootMenus: NavigationMenuItem[]
  activeRootId?: string
  menus: NavigationMenuItem[]
  loading: boolean
  open: boolean
  desktopOpen: boolean
  onClose: () => void
  onRootSelect: (menu: NavigationMenuItem) => void
}

type SidebarItemsProps = {
  menus: NavigationMenuItem[]
  onNavigate: () => void
  depth?: number
}

function SidebarItems({
  menus,
  onNavigate,
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
                  onNavigate={onNavigate}
                  depth={depth + 1}
                />
              </div>
            </section>
          )
        }

        if (!menu.path) return null

        return (
          <NavLink
            key={menu.id}
            to={menu.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-active font-semibold text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-surface-soft hover:text-foreground",
              ].join(" ")
            }
          >
            <MenuIcon name={menu.icon} />
            <span className="truncate">{menu.label}</span>
          </NavLink>
        )
      })}
    </>
  )
}

export const Sidebar = memo(function Sidebar({
  title,
  rootMenus,
  activeRootId,
  menus,
  loading,
  open,
  desktopOpen,
  onClose,
  onRootSelect,
}: SidebarProps) {
  useEffect(() => {
    if (!open) return

    document.getElementById("sidebar-mobile-close")?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        document.getElementById("sidebar-mobile-open")?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  return (
    <>
      <button
        type="button"
        aria-label="사이드 메뉴 닫기"
        onClick={onClose}
        data-open={open}
        tabIndex={open ? 0 : -1}
        className="fixed inset-x-0 bottom-0 top-[var(--layout-header-height)] z-[var(--z-backdrop)] hidden bg-backdrop data-[open=true]:block lg:hidden"
      />

      <aside
        id="app-sidebar"
        aria-label="사이드 메뉴"
        data-open={open}
        className={[
          "fixed bottom-0 left-0 top-[var(--layout-header-height)] z-[var(--z-sidebar)] w-[var(--layout-sidebar-mobile-width)] -translate-x-full overflow-y-auto border-r border-border bg-sidebar shadow-drawer transition-transform duration-200 data-[open=true]:translate-x-0 lg:sticky lg:top-[var(--layout-header-height)] lg:h-[calc(100dvh-var(--layout-header-height))] lg:w-auto lg:translate-x-0 lg:shadow-none",
          desktopOpen ? "" : "lg:hidden",
        ].join(" ")}
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-4">
          <strong className="text-sm text-foreground">{title}</strong>
          <div className="lg:hidden">
            <Button size="sm" onClick={onClose} id="sidebar-mobile-close" aria-label="사이드 메뉴 닫기">
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>

        <nav className="border-b border-border p-3" aria-label="홈 메뉴">
          <NavLink
            to="/app"
            end
            onClick={onClose}
            className={({ isActive }) => [
              "flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors",
              isActive
                ? "bg-sidebar-active font-semibold text-sidebar-active-foreground"
                : "text-sidebar-foreground hover:bg-surface-soft hover:text-foreground",
            ].join(" ")}
          >
            <House aria-hidden="true" className="size-4 shrink-0" />
            <span>홈</span>
          </NavLink>
        </nav>

        <nav className="border-b border-border p-3 lg:hidden" aria-label="주요 업무 메뉴">
          <div className="grid grid-cols-2 gap-2">
            {rootMenus.map((menu) => {
              const path = getFirstMenuPath(menu)
              if (!path) return null
              return (
                <Button
                  key={menu.id}
                  primary={menu.id === activeRootId}
                  aria-pressed={menu.id === activeRootId}
                  onClick={() => onRootSelect(menu)}
                >
                  {menu.label}
                </Button>
              )
            })}
          </div>
        </nav>

        <nav className="p-3" aria-label={title + " 하위 메뉴"}>
          {loading ? (
            <div role="status" aria-label="사이드 메뉴 불러오는 중" className="grid gap-4 p-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ) : <SidebarItems menus={menus} onNavigate={onClose} />}
        </nav>
      </aside>
    </>
  )
})
