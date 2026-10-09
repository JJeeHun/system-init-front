import { Link } from "react-router-dom"
import { House, ArrowRight } from "lucide-react"

import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"
import { Panel } from "@/shared/ui/panel"

export function HomePage() {
  return (
    <PageLayout>
      <PageHeader title="홈" description="FlowStock 관리 콘솔의 시작 화면입니다." />
      <Panel>
        <Panel.Header title="시작하기" description="왼쪽 사이드바 또는 상단 메뉴에서 업무 화면으로 이동할 수 있습니다." />
        <Panel.Content>
          <Link
            to="/app/master/common-code"
            className="inline-flex min-h-10 items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-primary"
          >
            <House aria-hidden="true" className="size-4 text-primary" />
            공통코드 관리
            <ArrowRight aria-hidden="true" className="size-4 text-foreground-soft" />
          </Link>
        </Panel.Content>
      </Panel>
    </PageLayout>
  )
}
