import type { ReactNode } from "react"

import { useAuth } from "@/app/auth/AuthProvider"
import { AppHeader } from "@/app/layouts/AppHeader"
import { TabWorkspace } from "@/app/routing/TabWorkspace"

import { useLogout } from "@/features/auth/hooks/use-logout"
import { Sidebar } from "@/features/navigation/components/Sidebar"

import { useAppTranslation } from "@/shared/i18n"
import { useSidebarStore } from "@/shared/stores"
import { Skeleton } from "@/shared/components/ui/skeleton"

function SidebarGrid({ children }: { children: ReactNode }) {
  const expanded = useSidebarStore((state) => state.desktopExpanded)

  return (
    <div className={[
      "grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden",
      expanded
        ? "lg:grid-cols-[var(--layout-sidebar-width)_minmax(0,1fr)]"
        : "lg:grid-cols-[4.5rem_minmax(0,1fr)]",
    ].join(" ")}>
      {children}
    </div>
  )
}

export function MainLayout() {
  const { t } = useAppTranslation()
  const { user, allowedMenus: menus, isLoading, isError } = useAuth()
  const logout = useLogout()

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-background">
      <AppHeader
        menus={menus}
        menuLoading={isLoading}
        user={user}
        userLoading={isLoading}
        userError={isError}
        onLogout={logout}
      />

      <SidebarGrid>
        <Sidebar rootMenus={menus} loading={isLoading} />

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
      </SidebarGrid>
    </div>
  )
}
