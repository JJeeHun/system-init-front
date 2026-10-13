import { memo, useLayoutEffect, useState } from "react"
import { useLocation, useNavigate, useOutletContext } from "react-router-dom"

import type { MainLayoutContext } from "@/app/layouts/MainLayout"
import { resolveRoute, routePath } from "@/app/routing/route-config"
import { TabPageProvider } from "@/app/routing/TabPageContext"
import { findMenuByPath, getMenuLabel } from "@/features/navigation/lib/navigation-menu"
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
      <TabPageProvider value={{ path, params: match.params, isActive: active }}>
        <Page />
      </TabPageProvider>
    </div>
  )
})

function StandalonePage({ path }: { path: string }) {
  const match = resolveRoute(path)
  if (!match) return null

  const Page = match.route.Component

  return (
    <TabPageProvider value={{ path, params: match.params, isActive: true }}>
      <Page />
    </TabPageProvider>
  )
}

export function TabWorkspace() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { navigation } = useOutletContext<MainLayoutContext>()
  const { t } = useAppTranslation()
  const current = resolveRoute(pathname)
  const activePath = current?.route.mode === "tab" ? pathname : null

  const [openPaths, setOpenPaths] = useState<string[]>(() => activePath ? [activePath] : [])

  useLayoutEffect(() => {
    if (!activePath) return
    setOpenPaths(previous =>
      previous.includes(activePath) ? previous : [...previous, activePath],
    )
  }, [activePath])

  const closeTab = (path: string) => {
    const remaining = openPaths.filter(openPath => openPath !== path)
    if (path === activePath) {
      navigate(remaining[remaining.length - 1] ?? routePath("home"), { replace: true })
    }
    setOpenPaths(remaining)
  }

  const tabs = openPaths.map(path => {
    const menu = findMenuByPath(navigation.menus, path)
    const match = resolveRoute(path)
    return {
      path,
      label: menu ? getMenuLabel(menu, t) : match ? t(match.route.titleKey) : path,
    }
  })

  const isTab = current?.route.mode === "tab"

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className={isTab ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" : "hidden"}>
        <OpenPageTabs tabs={tabs} activePath={activePath} onClose={closeTab} />
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {openPaths.map(path => (
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
