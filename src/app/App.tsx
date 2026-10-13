import { useEffect, useRef, useSyncExternalStore } from "react"
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/app/layouts/AuthLayout"
import { MainLayout } from "@/app/layouts/MainLayout"
import { routePath } from "@/app/routing/route-config"
import { RequireAuth } from "@/app/routing/RequireAuth"
import { getForbiddenGeneration, subscribeForbiddenNavigation } from "@/features/auth/api/auth-response"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { LoginPage } from "@/pages/LoginPage"

function AuthResponseNavigation() {
  const generation = useSyncExternalStore(subscribeForbiddenNavigation, getForbiddenGeneration, () => 0)
  const lastHandled = useRef(getForbiddenGeneration())
  const navigate = useNavigate()

  useEffect(() => {
    if (generation <= lastHandled.current) return
    lastHandled.current = generation
    navigate(routePath("forbidden"), { replace: true })
  }, [generation, navigate])

  return null
}

export default function App() {
  return (
    <>
      <AuthResponseNavigation />
      <Routes>
        <Route path="/dev/ui" element={<UiPlaygroundPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        />

        <Route path="/" element={<Navigate to={routePath("home")} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
