import { useEffect, useRef, useSyncExternalStore } from "react"
import { Navigate, Route, Routes, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/app/layouts/AuthLayout"
import { MainLayout } from "@/app/layouts/MainLayout"
import { RequireAuth } from "@/app/routing/RequireAuth"
import { getForbiddenGeneration, subscribeForbiddenNavigation } from "@/features/auth/api/auth-response"
import { useAppTranslation } from "@/shared/i18n"
import { PageLayout } from "@/shared/layout/page"
import { ErrorState } from "@/shared/ui/error-state"
import { CommonCodePage } from "@/pages/CommonCodePage"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { MenuManagementPage } from "@/pages/MenuManagementPage"
import { MenuPage } from "@/pages/MenuPage"
import { RoleManagementPage } from "@/pages/RoleManagementPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"
import { UserManagementPage } from "@/pages/UserManagementPage"

function AuthResponseNavigation() {
  const generation = useSyncExternalStore(subscribeForbiddenNavigation, getForbiddenGeneration, () => 0)
  const lastHandled = useRef(getForbiddenGeneration())
  const navigate = useNavigate()

  useEffect(() => {
    if (generation <= lastHandled.current) return
    lastHandled.current = generation
    navigate("/app/forbidden", { replace: true })
  }, [generation, navigate])

  return null
}

function ForbiddenPage() {
  const { t } = useAppTranslation()
  return (
    <PageLayout>
      <ErrorState title={t("auth:forbidden.title")} message={t("auth:forbidden.description")} />
    </PageLayout>
  )
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
          path="/app"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="forbidden" element={<ForbiddenPage />} />
          <Route path="master/common-code" element={<CommonCodePage />} />
          <Route path="system/menus" element={<MenuManagementPage />} />
          <Route path="system/users" element={<UserManagementPage />} />
          <Route path="system/roles" element={<RoleManagementPage />} />
          <Route path="dev/ui" element={<UiPlaygroundPage />} />
          <Route path="*" element={<MenuPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
