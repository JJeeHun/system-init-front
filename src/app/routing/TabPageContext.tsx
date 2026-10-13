import { createContext, useContext } from "react"
import type { ReactNode } from "react"

export type TabPageInfo = {
  path: string
  params: Readonly<Record<string, string | undefined>>
  isActive: boolean
}

const TabPageContext = createContext<TabPageInfo | null>(null)

export function TabPageProvider({ value, children }: { value: TabPageInfo; children: ReactNode }) {
  return <TabPageContext.Provider value={value}>{children}</TabPageContext.Provider>
}

export function useTabPage() {
  const value = useContext(TabPageContext)
  if (!value) throw new Error("This page is not inside a tab workspace")
  return value
}
