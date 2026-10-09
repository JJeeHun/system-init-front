import { Boxes, MapPin, Menu } from "lucide-react"
import { Link } from "react-router-dom"

import { HeaderMenu } from "@/features/navigation/components/HeaderMenu"
import type { NavigationMenuItem } from "@/features/navigation/types/navigation.types"
import type { CurrentUser } from "@/features/user/types/user.types"
import { useAppTranslation } from "@/shared/i18n"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/ui/button"

type AppHeaderProps = {
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

function Brand({ expanded }: { expanded: boolean }) {
  const { t } = useAppTranslation()
  return (
    <div className="flex min-w-0 items-center gap-2 px-3 lg:border-r lg:border-header-border">
      <Link to="/app" aria-label={t("navigation:header.homeLink")} className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-header-active">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-header-accent">
          <Boxes aria-hidden="true" className="size-5" />
        </span>
        <span className={expanded ? "grid min-w-0" : "grid min-w-0 lg:hidden"}>
          <strong className="truncate text-sm">FlowStock</strong>
          <small className="hidden truncate text-xs uppercase tracking-wider text-header-faint sm:block">
            WMS Console
          </small>
        </span>
      </Link>
    </div>
  )
}

function UserSummary({ user, loading, error }: { user: CurrentUser | null; loading: boolean; error: boolean }) {
  const { t } = useAppTranslation()

  if (loading) {
    return (
      <div role="status" aria-label={t("navigation:header.userLoading")} className="hidden items-center gap-2 sm:flex">
        <Skeleton className="h-8 w-28 bg-header-surface-hover" />
      </div>
    )
  }

  if (error) {
    return <span role="status" className="hidden text-xs text-header-muted sm:inline">{t("navigation:header.userLoadFailed")}</span>
  }

  if (!user) return null

  return (
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
  )
}

function HeaderActions({
  user,
  userLoading,
  userError,
  mobileSidebarOpen,
  onOpenSidebar,
}: Pick<AppHeaderProps, "user" | "userLoading" | "userError" | "mobileSidebarOpen" | "onOpenSidebar">) {
  const { t, language, changeLanguage } = useAppTranslation()

  return (
    <div className="flex items-center gap-2 px-3">
      <UserSummary user={user} loading={userLoading} error={userError} />
      <Button
        header
        size="sm"
        onClick={() => void changeLanguage(language === "en" ? "ko" : "en")}
        aria-label={t(language === "en" ? "common:language.switchToKorean" : "common:language.switchToEnglish")}
      >
        {language === "en" ? "EN" : "KO"}
      </Button>
      <div className="lg:hidden">
        <Button
          header
          size="sm"
          onClick={onOpenSidebar}
          aria-label={t("navigation:header.mobileOpen")}
          aria-expanded={mobileSidebarOpen}
          aria-controls="app-sidebar"
          id="sidebar-mobile-open"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </div>
  )
}

export function AppHeader({
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
}: AppHeaderProps) {
  return (
    <header className={[
      "sticky top-0 z-[var(--z-sticky)] grid min-h-[var(--layout-header-height)] grid-cols-[minmax(0,1fr)_auto] border-b border-header-border bg-header text-header-foreground",
      desktopSidebarOpen
        ? "lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)_auto]"
        : "lg:grid-cols-[4.5rem_minmax(0,1fr)_auto]",
    ].join(" ")}>
      <Brand expanded={desktopSidebarOpen} />
      <HeaderMenu menus={menus} loading={menuLoading} selectedRootId={activeRootId} onSelectRoot={onRootSelect} />
      <HeaderActions
        user={user}
        userLoading={userLoading}
        userError={userError}
        mobileSidebarOpen={mobileSidebarOpen}
        onOpenSidebar={onOpenSidebar}
      />
    </header>
  )
}
