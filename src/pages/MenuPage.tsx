import { useMainNavigation } from "@/features/navigation/hooks/use-main-navigation"

export function MenuPage() {
  const navigation = useMainNavigation()

  if (!navigation.currentMenu) {
    return null
  }

  return (
    <>
      <section className="flex flex-col gap-3 border-b border-border bg-card px-page-x py-page-y sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            {navigation.activeRootMenu?.label}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {navigation.currentMenu.label}
          </h1>
          <p className="mt-2 text-sm text-foreground-soft">
            권한 메뉴와 라우팅 골격이 연결된 기본 화면입니다.
          </p>
        </div>
      </section>

      <section className="px-page-x py-section">
        <div className="min-h-52 rounded-lg border border-border bg-card p-5 shadow-panel">
          <div className="text-sm font-semibold text-foreground">
            {navigation.currentMenu.label}
          </div>
          <p className="mt-2 text-sm text-foreground-soft">
            실제 업무 UI는 해당 Feature에서 구현합니다.
          </p>
        </div>
      </section>
    </>
  )
}
