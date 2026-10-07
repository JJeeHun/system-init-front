import { CommonCodeGroupPanel } from "@/features/common-code/components/CommonCodeGroupPanel"
import { CommonCodeItemPanel } from "@/features/common-code/components/CommonCodeItemPanel"
import { useCommonCodePage } from "@/features/common-code/hooks/use-common-code-page"

export function CommonCodePage() {
  const commonCode = useCommonCodePage()

  return (
    <>
      <section className="border-b border-border bg-card px-page-x py-page-y">
        <div className="max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">
            기준정보
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            공통코드 관리
          </h1>
          <p className="mt-2 text-sm text-foreground-soft">
            그룹과 상세코드를 Master / Detail 고정 2단계로 관리합니다.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-content px-page-x py-section xl:grid-cols-3">
        <div className="xl:col-span-1">
          <CommonCodeGroupPanel
            groups={commonCode.groups}
            selectedGroupId={commonCode.selectedGroup?.id ?? null}
            isLoading={commonCode.isLoading}
            loadErrorMessage={commonCode.loadErrorMessage}
            onSelect={commonCode.selectGroup}
            form={commonCode.groupForm}
          />
        </div>

        <div className="xl:col-span-2">
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
    </>
  )
}
