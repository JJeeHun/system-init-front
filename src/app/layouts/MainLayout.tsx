import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { useAuth } from "@/app/auth/AuthProvider"
import { AppHeader } from "@/app/layouts/AppHeader"
import { TabWorkspace } from "@/app/routing/TabWorkspace"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { findRootMenuByPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { useAppTranslation } from "@/shared/i18n"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function MainLayout() {
  const { t } = useAppTranslation()
  const { pathname } = useLocation()
  const { user, allowedMenus: menus, isLoading, isError } = useAuth()
  const [selectedRootId, selectRootMenu] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true)
  const openMobileSidebar = () => setMobileSidebarOpen(true)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)
  const toggleDesktopSidebar = () => setDesktopSidebarExpanded(open => !open)
  const logout = useLogout()

  const routeRootMenu = findRootMenuByPath(menus, pathname)
  useEffect(() => {
    if (routeRootMenu) selectRootMenu(routeRootMenu.id)
  }, [pathname, menus, selectRootMenu])

  const selectedRootMenu = menus.find((menu) => menu.id === selectedRootId) ?? routeRootMenu ?? menus[0] ?? null
  const sidebarMenus = selectedRootMenu?.children ?? []
  const onSelectRoot = (menu: (typeof menus)[number]) => selectRootMenu(menu.id)

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-background">
      <AppHeader
        menus={menus}
        menuLoading={isLoading}
        user={user}
        userLoading={isLoading}
        userError={isError}
        activeRootId={selectedRootMenu?.id}
        desktopSidebarOpen={desktopSidebarExpanded}
        mobileSidebarOpen={mobileSidebarOpen}
        onRootSelect={onSelectRoot}
        onOpenSidebar={openMobileSidebar}
        onLogout={logout}
      />

      <div className={[
        "grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden",
        desktopSidebarExpanded
          ? "lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)]"
          : "lg:grid-cols-[4.5rem_minmax(0,1fr)]",
      ].join(" ")}>
        <Sidebar
          title={selectedRootMenu ? getMenuLabel(selectedRootMenu, t) : t("navigation:sidebar.fallbackTitle")}
          rootMenus={menus}
          activeRootId={selectedRootMenu?.id}
          menus={sidebarMenus}
          loading={isLoading}
          open={mobileSidebarOpen}
          desktopOpen={desktopSidebarExpanded}
          onClose={closeMobileSidebar}
          onRootSelect={onSelectRoot}
          onToggleDesktopSidebar={toggleDesktopSidebar}
        />

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {isLoading ? (
              <div role="status" aria-label={t("navigation:layout.loading")} className="grid gap-4 px-page-x py-page-y">
                <span className="sr-only">{t("navigation:layout.loadingDescription")}</span>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : isError ? (
              <div role="alert" className="px-page-x py-page-y text-sm text-destructive">
                {t("navigation:layout.loadFailed")}
              </div>
            ) : (
              <TabWorkspace />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
