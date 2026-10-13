import { memo, useLayoutEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { navigationSettings } from "@/app/navigation/navigation-settings"
import { useNavigationStore } from "@/app/navigation/use-navigation-store"
import { resolveRoute, routePath } from "@/app/routing/route-config"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import { useAppTranslation } from "@/shared/i18n"
import { OpenPageTabs } from "@/shared/ui/open-page-tabs"

type MountedTabPageProps = {
  path: string
  active: boolean
}

const MountedTabPage = memo(function MountedTabPage({ path, active }: MountedTabPageProps) {
  const match = resolveRoute(path)
  if (!match) return null

  const Page = match.route.Component
  return (
    <div hidden={!active}>
      <Page path={path} />
    </div>
  )
})

function StandalonePage({ path }: { path: string }) {
  const match = resolveRoute(path)
  if (!match) return null
  const Page = match.route.Component
  return <Page path={path} />
}

export function TabWorkspace() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const menuIndex = useNavigationStore((state) => state.menuIndex)
  const hasLoadedMenus = useNavigationStore((state) => state.hasLoadedMenus)
  const findMenu = useNavigationStore((state) => state.findMenu)
  const canAccess = useNavigationStore((state) => state.canAccess)
  const { t } = useAppTranslation()
  const current = resolveRoute(pathname)
  const activePath = navigationSettings.tabsEnabled && current?.route.mode === "tab" ? pathname : null
  const [openPaths, setOpenPaths] = useState<string[]>(() => activePath ? [activePath] : [])

  useLayoutEffect(() => {
    if (!activePath || !canAccess(activePath)) return
    setOpenPaths((previous) => previous.includes(activePath) ? previous : [...previous, activePath])
  }, [activePath, canAccess, menuIndex])

  useLayoutEffect(() => {
    if (!hasLoadedMenus) return
    setOpenPaths((previous) => {
      const allowed = previous.filter(canAccess)
      return allowed.length === previous.length ? previous : allowed
    })
    if (!canAccess(pathname)) navigate(routePath("forbidden"), { replace: true })
  }, [hasLoadedMenus, menuIndex, pathname, canAccess, navigate])

  const closeTab = (path: string) => {
    const remaining = openPaths.filter((openPath) => openPath !== path)
    if (path === activePath) navigate(remaining[remaining.length - 1] ?? routePath("home"), { replace: true })
    setOpenPaths(remaining)
  }

  const tabs = openPaths.map((path) => {
    const menu = findMenu(path)
    const match = resolveRoute(path)
    return {
      path,
      label: menu ? getMenuLabel(menu, t) : match ? t(match.route.titleKey) : path,
    }
  })

  if (!hasLoadedMenus || !canAccess(pathname)) return null

  if (!navigationSettings.tabsEnabled) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <StandalonePage key={pathname} path={pathname} />
        </div>
      </div>
    )
  }

  const isTab = current?.route.mode === "tab"

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className={isTab ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" : "hidden"}>
        <OpenPageTabs tabs={tabs} activePath={activePath} onClose={closeTab} />
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {openPaths.map((path) => (
            <MountedTabPage key={path} path={path} active={path === activePath} />
          ))}
        </div>
      </div>
      {current?.route.mode === "page" ? (
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <StandalonePage key={pathname} path={pathname} />
        </div>
      ) : null}
    </div>
  )
}
