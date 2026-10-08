import { Outlet } from "react-router-dom"

import { Header } from "@/features/navigation/components/Header"
import { Sidebar } from "@/features/navigation/components/Sidebar"
import { useMainNavigation } from "@/features/navigation/hooks/use-main-navigation"
import { useCurrentUser } from "@/features/user/hooks/use-current-user"

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
        user={currentUser.data ?? null}
        activeRootId={navigation.activeRootMenu?.id}
        onRootSelect={navigation.selectRootMenu}
        onOpenSidebar={navigation.openSidebar}
      />

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)]">
        <Sidebar
          title={navigation.activeRootMenu?.label ?? "메뉴"}
          rootMenus={navigation.menus}
          activeRootId={navigation.activeRootMenu?.id}
          menus={navigation.sidebarMenus}
          open={navigation.sidebarOpen}
          onRootSelect={navigation.selectRootMenu}
          onClose={navigation.closeSidebar}
        />

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
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
          </div>
        </main>
      </div>
    </div>
  )
}
