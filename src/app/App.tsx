import { Navigate, Route, Routes } from "react-router-dom"

import { AuthLayout } from "@/app/layouts/AuthLayout"
import { MainLayout } from "@/app/layouts/MainLayout"
import { RequireAuth } from "@/app/routing/RequireAuth"
import { CommonCodePage } from "@/pages/CommonCodePage"
import { LoginPage } from "@/pages/LoginPage"
import { MenuPage } from "@/pages/MenuPage"
import { UiPlaygroundPage } from "@/pages/UiPlaygroundPage"

export default function App() {
  return (
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
        <Route path="master/common-code" element={<CommonCodePage />} />
        <Route path="*" element={<MenuPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
