import { Outlet } from "react-router-dom"

import { Header } from "@/features/navigation/components/Header"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { useMainNavigation } from "@/features/navigation/hooks/use-main-navigation"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"
import { OpenPageTabs } from "@/shared/ui/open-page-tabs"
import { Skeleton } from "@/shared/components/ui/skeleton"

export type MainLayoutContext = {
  navigation: ReturnType<typeof useMainNavigation>
}

export function MainLayout() {
  const navigation = useMainNavigation()
  const currentUser = useCurrentUser()

  const context: MainLayoutContext = {
    navigation,
  }

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-background">
      <Header
        menus={navigation.menus}
        menuLoading={navigation.isLoading}
        user={currentUser.data ?? null}
        userLoading={currentUser.isLoading}
        userError={currentUser.isError}
        activeRootId={navigation.selectedRootMenu?.id}
        desktopSidebarOpen={navigation.desktopSidebarOpen}
        mobileSidebarOpen={navigation.sidebarOpen}
        onRootSelect={navigation.selectRootMenu}
        onToggleDesktopSidebar={navigation.toggleDesktopSidebar}
        onOpenSidebar={navigation.openSidebar}
      />

      <div className={[
        "grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden",
        navigation.desktopSidebarOpen
          ? "lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)]"
          : "lg:grid-cols-[minmax(0,1fr)]",
      ].join(" ")}>
        <Sidebar
          title={navigation.selectedRootMenu?.label ?? "메뉴"}
          rootMenus={navigation.menus}
          activeRootId={navigation.selectedRootMenu?.id}
          menus={navigation.sidebarMenus}
          loading={navigation.isLoading}
          open={navigation.sidebarOpen}
          desktopOpen={navigation.desktopSidebarOpen}
          onClose={navigation.closeSidebar}
          onRootSelect={navigation.selectRootMenu}
        />

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <OpenPageTabs />
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            {navigation.isLoading ? (
              <div role="status" aria-label="화면 메뉴 준비 중" className="grid gap-4 px-page-x py-page-y">
                <span className="sr-only">메뉴를 불러오는 중입니다.</span>
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : navigation.isError ? (
              <div role="alert" className="px-page-x py-page-y text-sm text-destructive">
                메뉴 정보를 불러오지 못했습니다.
              </div>
            ) : (
              <Outlet context={context} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
