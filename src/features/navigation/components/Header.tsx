import { memo } from "react"
import { Boxes, MapPin, Menu } from "lucide-react"
import { Link } from "react-router-dom"

import { getFirstMenuPath } from "@/features/navigation/lib/navigation-menu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import type { CurrentUser } from "@/features/user/types/user.types"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/ui/button"

type HeaderProps = {
  menus: NavigationMenuItem[]
  menuLoading: boolean
  user: CurrentUser | null
  userLoading: boolean
  userError: boolean
  activeRootId?: string
  desktopSidebarOpen: boolean
  mobileSidebarOpen: boolean
  onRootSelect: (menu: NavigationMenuItem) => void
  onOpenSidebar: () => void
}

export const Header = memo(function Header({
  menus,
  menuLoading,
  user,
  userLoading,
  userError,
  activeRootId,
  desktopSidebarOpen,
  mobileSidebarOpen,
  onRootSelect,
  onOpenSidebar,
}: HeaderProps) {
  return (
    <header className={[
      "sticky top-0 z-[var(--z-sticky)] grid min-h-[var(--layout-header-height)] grid-cols-[minmax(0,1fr)_auto] border-b border-header-border bg-header text-header-foreground",
      desktopSidebarOpen
        ? "lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_auto]"
        : "lg:grid-cols-[4.5rem_minmax(0,1fr)_auto]",
    ].join(" ")}>
      <div className="flex min-w-0 items-center gap-2 px-3 lg:border-r lg:border-header-border">
        <Link to="/app" aria-label="홈으로 이동" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-header-active">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-header-accent">
            <Boxes aria-hidden="true" className="size-5" />
          </span>
          <span className={desktopSidebarOpen ? "grid min-w-0" : "grid min-w-0 lg:hidden"}>
            <strong className="truncate text-sm">FlowStock</strong>
            <small className="hidden truncate text-xs uppercase tracking-wider text-header-faint sm:block">
              WMS Console
            </small>
          </span>
        </Link>
      </div>

      <nav className="hidden min-w-0 overflow-x-auto lg:flex" aria-label="주요 업무 메뉴">
        {menuLoading ? (
          <div role="status" aria-label="메뉴 불러오는 중" className="flex items-center gap-4 px-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-20 bg-header-surface-hover" />
            ))}
          </div>
        ) : menus.map((menu) => {
          const path = getFirstMenuPath(menu)
          if (!path) return null
          const active = menu.id === activeRootId
          return (
            <div
              key={menu.id}
              className={[
                "flex min-w-24 items-center justify-center border-b-2 px-2",
                active
                  ? "border-header-active bg-header-surface"
                  : "border-transparent",
              ].join(" ")}
            >
              <Button
                header
                size="sm"
                aria-pressed={active}
                onClick={() => onRootSelect(menu)}
              >
                {menu.label}
              </Button>
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 px-3">
        {userLoading ? (
          <div role="status" aria-label="사용자 정보 불러오는 중" className="hidden items-center gap-2 sm:flex">
            <Skeleton className="h-8 w-28 bg-header-surface-hover" />
          </div>
        ) : user ? (
          <>
            <span className="hidden items-center gap-2 text-xs text-header-muted xl:inline-flex">
              <MapPin aria-hidden="true" className="size-4" />
              {user.centerName}
            </span>
            <div className="hidden h-10 items-center gap-2 rounded-md border border-header-border bg-header-surface px-3 sm:flex">
              <span className="grid size-7 place-items-center rounded-full bg-header-accent text-xs font-bold">
                {user.name.slice(0, 1)}
              </span>
              <span className="hidden text-left md:grid">
                <strong className="text-xs">{user.name}</strong>
                <small className="text-xs text-header-faint">{user.roleName}</small>
              </span>
            </div>
          </>
        ) : userError ? (
          <span role="status" className="hidden text-xs text-header-muted sm:inline">사용자 정보 조회 실패</span>
        ) : null}

        <div className="lg:hidden">
          <Button
            header
            size="sm"
            onClick={onOpenSidebar}
            aria-label="사이드 메뉴 열기"
            aria-expanded={mobileSidebarOpen}
            aria-controls="app-sidebar"
            id="sidebar-mobile-open"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  )
})
