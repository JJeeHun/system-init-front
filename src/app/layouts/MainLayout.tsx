import { AppHeader } from "@/app/layouts/AppHeader"
import { NavigationBridge } from "@/app/navigation/NavigationBridge"
import { useNavigationStore } from "@/app/navigation/use-navigation-store"
import { TabWorkspace } from "@/app/routing/TabWorkspace"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"
import { config } from "@/shared/config/config"
import { useAppTranslation } from "@/shared/i18n"
import { CrudPermissionsProvider } from "@/shared/ui/crud-actions"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function MainLayout() {
  const { t } = useAppTranslation()
  const menus = useNavigationStore((state) => state.menus)
  const menuIndex = useNavigationStore((state) => state.menuIndex)
  const hasLoadedMenus = useNavigationStore((state) => state.hasLoadedMenus)
  const isLoading = useNavigationStore((state) => state.isLoading)
  const isError = useNavigationStore((state) => state.isError)
  const selectedRootId = useNavigationStore((state) => state.selectedRootId)
  const routeRootMenu = useNavigationStore((state) => state.findRootMenu(state.currentPath))
  const mobileSidebarOpen = useNavigationStore((state) => state.isMobileSidebarOpen)
  const desktopSidebarExpanded = useNavigationStore((state) => state.isDesktopSidebarExpanded)
  const selectRootMenu = useNavigationStore((state) => state.selectRootMenu)
  const openMobileSidebar = useNavigationStore((state) => state.openMobileSidebar)
  const closeMobileSidebar = useNavigationStore((state) => state.closeMobileSidebar)
  const toggleDesktopSidebar = useNavigationStore((state) => state.toggleDesktopSidebar)
  const currentUser = useCurrentUser()
  const logout = useLogout()

  const selectedRootMenu = menus.find((menu) => menu.id === selectedRootId) ?? routeRootMenu ?? menus[0] ?? null
  const sidebarMenus = selectedRootMenu?.children ?? []
  const onSelectRoot = (menu: (typeof menus)[number]) => selectRootMenu(menu.id)

  return (
    <CrudPermissionsProvider
      resolvePermissions={menuId => Object.values(menuIndex).find(entry => entry.menu.id === menuId)?.menu.permissions}
      bypassPermissions={config.app.canBypassCrudPermissions(currentUser.data?.roleId)}
    >
      <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-background">
      <NavigationBridge />
      <AppHeader
        menus={menus}
        menuLoading={isLoading}
        user={currentUser.data ?? null}
        userLoading={currentUser.isLoading}
        userError={currentUser.isError}
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
            {!hasLoadedMenus && isLoading ? (
              <div role="status" aria-label={t("navigation:layout.loading")} className="grid gap-4 px-page-x py-page-y">
                <span className="sr-only">{t("navigation:layout.loadingDescription")}</span>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !hasLoadedMenus && isError ? (
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
    </CrudPermissionsProvider>
  )
}
