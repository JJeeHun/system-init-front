import { Outlet } from "react-router-dom"

import { Header } from "@/features/navigation/components/Header"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { useMainNavigation } from "@/features/navigation/hooks/use-main-navigation"

export type MainLayoutContext = {
  navigation: ReturnType<typeof useMainNavigation>
}

export function MainLayout() {
  const navigation = useMainNavigation()

  const context: MainLayoutContext = {
    navigation,
  }

  return (
    <div className="min-h-dvh w-screen bg-background">
      <Header
        menus={navigation.menus}
        user={navigation.user}
        activeRootId={navigation.activeRootMenu?.id}
        onRootSelect={navigation.selectRootMenu}
        onOpenSidebar={navigation.openSidebar}
      />

      <div className="grid min-h-[calc(100dvh-var(--layout-header-height))] grid-cols-1 lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)]">
        <Sidebar
          title={navigation.activeRootMenu?.label ?? "메뉴"}
          rootMenus={navigation.menus}
          activeRootId={navigation.activeRootMenu?.id}
          menus={navigation.sidebarMenus}
          activeMenuIds={navigation.activeMenuIds}
          open={navigation.sidebarOpen}
          onRootSelect={navigation.selectRootMenu}
          onClose={navigation.closeSidebar}
        />

        <main className="min-w-0">
          {navigation.isLoading ? (
            <div className="px-page-x py-page-y text-sm text-foreground-soft">
              메뉴를 불러오는 중입니다.
            </div>
          ) : navigation.isError ? (
            <div className="px-page-x py-page-y text-sm text-destructive">
              메뉴 정보를 불러오지 못했습니다.
            </div>
          ) : (
            <Outlet context={context} />
          )}
        </main>
      </div>
    </div>
  )
}
