import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { getAuthSession } from "@/features/auth/storage/auth-session"

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!getAuthSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
