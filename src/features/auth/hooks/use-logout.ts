import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { clearAuthSession } from "@/features/auth/storage/auth-session"

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearAuthSession()
    queryClient.clear()
    navigate("/login", { replace: true })
  }
}
