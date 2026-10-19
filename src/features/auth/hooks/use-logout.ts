import { useNavigate } from "react-router-dom"

import { clearAuthSession } from "@/features/auth/storage/auth-session"

export function useLogout() {
  const navigate = useNavigate()

  return () => {
    clearAuthSession()
    navigate("/login", { replace: true })
  }
}
