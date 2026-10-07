import { Outlet } from "react-router-dom"

import { Header } from "@/features/navigation/components/Header"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { useMainNavigation } from "@/features/navigation/hooks/use-main-navigation"

export function MainLayout() {
  const navigation = useMainNavigation()

  return (
    <div className="min-h-dvh w-screen bg-background">
      <Header
        menus={navigation.menus}
        user={navigation.user}
        activeRootId={navigation.activeRootMenu?.id}
        onRootSelect={navigation.selectRootMenu}
        onOpenSidebar={navigation.openSidebar}
      />

      <div className="grid min-h-[calc(100dvh-var(--layout-header-height))] grid-cols-1 lg:[grid-template-columns:var(--layout-sidebar-width)_minmax(0,1fr)]">
        <Sidebar
          title={navigation.activeRootMenu?.label ?? "메뉴"}
          menus={navigation.sidebarMenus}
          activeMenuIds={navigation.activeMenuIds}
          open={navigation.sidebarOpen}
          onClose={navigation.closeSidebar}
        />

        <main className="min-w-0">
          {navigation.isLoading ? (
            <div className="p-page-x text-sm text-foreground-soft">
              메뉴를 불러오는 중입니다.
            </div>
          ) : navigation.isError ? (
            <div className="p-page-x text-sm text-destructive">
              메뉴 정보를 불러오지 못했습니다.
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
