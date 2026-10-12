import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuthSessionToken } from "@/features/auth/hooks/use-auth-session"
import { getSessionEndReason } from "@/features/auth/storage/auth-session"

type RequireAuthProps = {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const token = useAuthSessionToken()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: getSessionEndReason() }} />
  }

  return children
}
