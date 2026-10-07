import { Outlet } from "react-router-dom"

export function AuthLayout() {
  return (
    <main className="grid min-h-dvh w-screen place-items-center bg-background px-page-x py-page-y">
      <Outlet />
    </main>
  )
}
