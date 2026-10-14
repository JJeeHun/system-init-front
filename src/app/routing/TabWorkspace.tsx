import { Activity, memo, useLayoutEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "@/app/auth/AuthProvider"
import { navigationSettings } from "@/app/navigation/navigation-settings"
import { app, resolveRoute } from "@/app/routing/route-metadata"

import { findMenuByPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { NavigationPermissions } from "@/features/navigation/types/navigation.types"

import { useAppTranslation } from "@/shared/i18n"
import { OpenPageTabs } from "@/shared/ui/open-page-tabs"
import { PagePermissionScope } from "@/shared/ui/page-permissions"

type OpenTab = {
  path: string
  routeId: string
  menuId: string | null
  permissionSignature: string
  revision: number
}

function permissionSignature(permissions?: NavigationPermissions): string {
  if (!permissions) return "public"
  return [permissions.isView, permissions.isCreated, permissions.isUpdated, permissions.isDeleted]
    .map(Boolean).map(Number).join("")
}

function createTab(path: string, getMenuPermissions: (id: string) => NavigationPermissions | undefined): OpenTab | null {
  const match = resolveRoute(path)
  if (!match || match.route.mode !== "tab") return null

  const menuId = match.route.access === "menu" ? match.route.menu.id : null
  return {
    path,
    routeId: match.route.id,
    menuId,
    permissionSignature: menuId ? permissionSignature(getMenuPermissions(menuId)) : "public",
    revision: 0,
  }
}

type TabPageProps = {
  tab: OpenTab
  active: boolean
  permissions?: NavigationPermissions
  bypassCrudPermissions: boolean
}

const MountedTabPage = memo(function MountedTabPage({
  tab, active, permissions, bypassCrudPermissions,
}: TabPageProps) {
  const match = resolveRoute(tab.path)
  if (!match || match.route.mode !== "tab") return null

  const Page = match.route.Component
  return (
    <PagePermissionScope menuId={tab.menuId} permissions={permissions} bypassCrudPermissions={bypassCrudPermissions}>
      <Activity mode={active ? "visible" : "hidden"}>
        <div>
          <Page path={tab.path} />
        </div>
      </Activity>
    </PagePermissionScope>
  )
})

function StandalonePage({
  path,
  getMenuPermissions,
  bypassCrudPermissions,
}: {
  path: string
  getMenuPermissions: (id: string) => NavigationPermissions | undefined
  bypassCrudPermissions: boolean
}) {
  const match = resolveRoute(path)
  if (!match) return null
  const menuId = match.route.access === "menu" ? match.route.menu.id : null
  const Page = match.route.Component

  return (
    <PagePermissionScope
      menuId={menuId}
      permissions={menuId ? getMenuPermissions(menuId) : undefined}
      bypassCrudPermissions={bypassCrudPermissions}
    >
      <Page path={path} />
    </PagePermissionScope>
  )
}

export function TabWorkspace() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, allowedMenus, isLoading, isError, canAccessRoute, getMenuPermissions } = useAuth()
  const { t } = useAppTranslation()
  const bypassCrudPermissions = !isLoading && !isError && user?.roleId === "SYSTEM"
  const current = resolveRoute(pathname)
  const activePath = navigationSettings.tabsEnabled && current?.route.mode === "tab" ? pathname : null

  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    const initial = activePath && canAccessRoute(activePath) ? createTab(activePath, getMenuPermissions) : null
    return initial ? [initial] : []
  })
  const lastValidPath = useRef(app.home.path)
  const closingPath = useRef<string | null>(null)
  const rejectedPath = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (isLoading || isError) return

    if (closingPath.current && closingPath.current !== pathname) closingPath.current = null

    let changed = false
    const allowed = openTabs.flatMap((tab) => {
      if (!canAccessRoute(tab.path)) {
        changed = true
        return []
      }

      const signature = tab.menuId ? permissionSignature(getMenuPermissions(tab.menuId)) : "public"
      if (signature === tab.permissionSignature) return [tab]

      changed = true
      return [{ ...tab, permissionSignature: signature, revision: tab.revision + 1 }]
    })

    const fallback = () => {
      const lastTab = allowed.find((tab) => tab.path === lastValidPath.current)
      return lastTab?.path ?? allowed[allowed.length - 1]?.path ?? app.home.path
    }

    if (!canAccessRoute(pathname)) {
      if (changed) setOpenTabs(allowed)
      const revoked = openTabs.some((tab) => tab.path === pathname)
      navigate(revoked ? fallback() : app.forbidden.path, { replace: true })
      return
    }

    if (activePath && !allowed.some((tab) => tab.path === activePath) && activePath !== closingPath.current) {
      if (allowed.length >= navigationSettings.maxOpenTabs) {
        if (changed) setOpenTabs(allowed)
        if (rejectedPath.current !== activePath) {
          toast.error(t("navigation:tabs.limitReached", { max: navigationSettings.maxOpenTabs }))
          rejectedPath.current = activePath
        }
        navigate(fallback(), { replace: true })
        return
      }

      const nextTab = createTab(activePath, getMenuPermissions)
      if (nextTab) {
        allowed.push(nextTab)
        changed = true
      }
    }

    if (changed) setOpenTabs(allowed)
    if (activePath !== closingPath.current) {
      lastValidPath.current = pathname
      rejectedPath.current = null
    }
  }, [pathname, activePath, openTabs, isLoading, isError, canAccessRoute, getMenuPermissions, navigate, t])

  const closeTab = (path: string) => {
    const remaining = openTabs.filter((tab) => tab.path !== path && canAccessRoute(tab.path))
    if (path === activePath) {
      closingPath.current = path
      navigate(remaining[remaining.length - 1]?.path ?? app.home.path, { replace: true })
    }
    setOpenTabs(remaining)
  }

  const visibleTabs = openTabs.filter((tab) => canAccessRoute(tab.path))
  const tabs = visibleTabs.map((tab) => {
    const menu = findMenuByPath(allowedMenus, tab.path)
    const match = resolveRoute(tab.path)
    return {
      path: tab.path,
      label: menu ? getMenuLabel(menu, t) : match ? t(match.route.titleKey) : tab.path,
    }
  })

  if (isLoading || isError || !canAccessRoute(pathname)) return null

  if (!navigationSettings.tabsEnabled) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <StandalonePage key={pathname} path={pathname} getMenuPermissions={getMenuPermissions} bypassCrudPermissions={bypassCrudPermissions} />
        </div>
      </div>
    )
  }

  const isTab = current?.route.mode === "tab"

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {(isTab || current?.route === app.home) ? (
        <OpenPageTabs
          tabs={tabs}
          activePath={visibleTabs.some((tab) => tab.path === activePath) ? activePath : null}
          homePath={app.home.path}
          homeActive={current?.route === app.home}
          onClose={closeTab}
        />
      ) : null}
      <div className={isTab ? "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto" : "hidden"}>
        {visibleTabs.map((tab) => (
          <MountedTabPage
            key={`${tab.path}:${tab.revision}`}
            tab={tab}
            active={tab.path === activePath}
            permissions={tab.menuId ? getMenuPermissions(tab.menuId) : undefined}
            bypassCrudPermissions={bypassCrudPermissions}
          />
        ))}
      </div>
      {current?.route.mode === "page" ? (
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <StandalonePage key={pathname} path={pathname} getMenuPermissions={getMenuPermissions} bypassCrudPermissions={bypassCrudPermissions} />
        </div>
      ) : null}
    </div>
  )
}
