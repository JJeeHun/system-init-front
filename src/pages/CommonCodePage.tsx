import { CommonCodeGroupPanel } from "@/features/common-code/components/CommonCodeGroupPanel"
import { CommonCodeItemPanel } from "@/features/common-code/components/CommonCodeItemPanel"
import { useCommonCodePage } from "@/features/common-code/hooks/use-common-code-page"
import { PageLayout } from "@/shared/layout/page"
import { PageHeader } from "@/shared/ui/page-header"

export function CommonCodePage() {
  const commonCode = useCommonCodePage()

  return (
    <PageLayout>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
          기준정보
        </p>
        <PageHeader
          title="공통코드 관리"
          description="그룹과 상세코드를 Master / Detail 고정 2단계로 관리합니다."
        />
      </div>

      <section className="grid min-w-0 grid-cols-1 gap-content xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-1">
          <CommonCodeGroupPanel
            groups={commonCode.groups}
            selectedGroupId={commonCode.selectedGroup?.id ?? null}
            isLoading={commonCode.isLoading}
            loadErrorMessage={commonCode.loadErrorMessage}
            onSelect={commonCode.selectGroup}
            form={commonCode.groupForm}
          />
        </div>

        <div className="min-w-0 xl:col-span-2">
          <CommonCodeItemPanel
            group={commonCode.selectedGroup}
            items={commonCode.items}
            selectedItem={commonCode.selectedItem}
            isLoading={commonCode.isLoading}
            loadErrorMessage={commonCode.loadErrorMessage}
            onSelect={commonCode.selectItem}
            form={commonCode.itemForm}
          />
        </div>
      </section>
    </PageLayout>
  )
}
