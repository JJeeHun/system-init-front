import { useOutletContext } from "react-router-dom"

import type { MainLayoutContext } from "@/app/layouts/MainLayout"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function MenuPage() {
  const { navigation } = useOutletContext<MainLayoutContext>()

  if (!navigation.currentMenu) {
    return (
      <PageLayout>
        <section className="min-w-0 rounded-lg border border-border bg-card p-panel shadow-panel">
          <PageHeader
            title="메뉴를 찾을 수 없습니다."
            description="현재 권한에 포함된 메뉴 경로인지 확인해주세요."
          />
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          {navigation.activeRootMenu?.label}
        </p>
        <PageHeader
          title={navigation.currentMenu.label}
          description="권한 메뉴와 라우팅 골격이 연결된 기본 화면입니다."
        />
      </div>

      <section className="min-w-0 rounded-lg border border-border bg-card p-panel shadow-panel">
        <p className="text-sm font-semibold text-foreground">
          {navigation.currentMenu.label}
        </p>
        <p className="mt-1 text-page-description text-foreground-soft">
          실제 업무 UI는 해당 Feature에서 구현합니다.
        </p>
      </section>
    </PageLayout>
  )
}
