import { useEffect } from "react"
import { QueryObserver, useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router-dom"

import { navigationQueries } from "@/features/navigation/api/navigation.api"
import { connectNavigationRouter, useNavigationStore } from "@/app/navigation/use-navigation-store"

/** One menu Query observer for the authenticated navigation shell. */
export function NavigationBridge() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const observer = new QueryObserver(queryClient, navigationQueries.menus())
    const sync = (result: ReturnType<typeof observer.getCurrentResult>) => {
      useNavigationStore.getState().updateMenuQuery(result)
    }
    const unsubscribe = observer.subscribe(sync)
    sync(observer.getCurrentResult())
    return () => {
      unsubscribe()
      useNavigationStore.getState().resetNavigation()
    }
  }, [queryClient])

  useEffect(() => connectNavigationRouter(navigate), [navigate])

  useEffect(() => {
    useNavigationStore.getState().updateCurrentPath(pathname)
  }, [pathname])

  return null
}
