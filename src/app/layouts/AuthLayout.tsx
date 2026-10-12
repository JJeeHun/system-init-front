import { Boxes, Layers3, ShieldCheck, UsersRound } from "lucide-react"
import { Outlet } from "react-router-dom"

import { useAppTranslation } from "@/shared/i18n"

export function AuthLayout() {
  const { t } = useAppTranslation()

  return (
    <main className="grid min-h-dvh w-full lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="relative hidden min-h-dvh flex-col overflow-hidden bg-header px-10 py-10 text-header-foreground lg:flex xl:px-16 xl:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/4 size-96 rounded-full border border-header-border" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-1/3 size-80 rounded-full border border-header-border" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-header-accent">
            <Boxes aria-hidden="true" className="size-6" />
          </span>
          <div>
            <strong className="block text-xl font-bold tracking-tight">FlowStock</strong>
            <span className="text-xs font-medium tracking-widest text-header-faint">WMS CONSOLE</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <span className="inline-flex items-center rounded-full border border-header-border bg-header-surface px-4 py-2 text-xs font-medium tracking-wide text-header-muted">
            {t("auth:hero.eyebrow")}
          </span>
          <h2 className="mt-7 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            {t("auth:hero.title")}
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-header-muted">
            {t("auth:hero.description")}
          </p>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-xl border border-header-border bg-header-surface p-4">
              <Layers3 aria-hidden="true" className="mb-4 size-6 text-header-active" />
              <span className="text-sm font-medium">{t("auth:hero.menus")}</span>
            </div>
            <div className="rounded-xl border border-header-border bg-header-surface p-4">
              <UsersRound aria-hidden="true" className="mb-4 size-6 text-header-active" />
              <span className="text-sm font-medium">{t("auth:hero.users")}</span>
            </div>
            <div className="rounded-xl border border-header-border bg-header-surface p-4">
              <ShieldCheck aria-hidden="true" className="mb-4 size-6 text-header-active" />
              <span className="text-sm font-medium">{t("auth:hero.permissions")}</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-header-faint">FlowStock · WMS Console</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
