import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import type {
  CommonCodeGroup,
  CommonCodeItem,
} from "@/features/common-code/types/common-code.types"
import { Button } from "@/shared/ui/button"
import { DataGrid } from "@/shared/ui/data-grid"
import type { DataGridColumn } from "@/shared/ui/data-grid"

type CommonCodeItemFormProps = {
  mode: "create" | "edit" | null
  fields: {
    code: UseFormRegisterReturn
    name: UseFormRegisterReturn
    description: UseFormRegisterReturn
    enabled: UseFormRegisterReturn
    sortOrder: UseFormRegisterReturn
  }
  errors: {
    code: string | null
    name: string | null
    sortOrder: string | null
  }
  isPending: boolean
  isDeleting: boolean
  errorMessage: string | null
  startCreate: () => void
  startEdit: () => void
  cancel: () => void
  submit: FormEventHandler<HTMLFormElement>
  delete: () => void
}

type CommonCodeItemPanelProps = {
  group: CommonCodeGroup | null
  items: CommonCodeItem[]
  selectedItem: CommonCodeItem | null
  isLoading: boolean
  loadErrorMessage: string | null
  onSelect: (item: CommonCodeItem) => void
  form: CommonCodeItemFormProps
}

const columns = [
  {
    key: "code",
    header: "코드",
    size: "md",
  },
  {
    key: "name",
    header: "코드명",
    size: "lg",
  },
  {
    key: "sortOrder",
    header: "순서",
    size: "sm",
    align: "right",
  },
  {
    key: "enabled",
    header: "사용",
    size: "sm",
    align: "center",
    format: (value) => (value === true ? "사용" : "미사용"),
  },
  {
    key: "description",
    header: "설명",
    size: "fill",
  },
] satisfies DataGridColumn<CommonCodeItem>[]

export function CommonCodeItemPanel({
  group,
  items,
  selectedItem,
  isLoading,
  loadErrorMessage,
  onSelect,
  form,
}: CommonCodeItemPanelProps) {
  const emptyMessage = loadErrorMessage
    ? loadErrorMessage
    : group
      ? "등록된 하위 코드가 없습니다."
      : "코드 그룹을 선택해주세요."

  return (
    <section className="rounded-lg border border-border bg-card shadow-panel">
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              상세 코드
            </h2>
            {group ? (
              <p className="mt-1 truncate text-xs text-foreground-soft">
                {group.code} · {group.name}
              </p>
            ) : (
              <p className="mt-1 text-xs text-foreground-soft">
                Detail · 고정 2Depth
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!group}
              onClick={form.startCreate}
            >
              코드 등록
            </Button>
            <Button
              size="sm"
              disabled={!selectedItem}
              onClick={form.startEdit}
            >
              수정
            </Button>
            <Button
              variant="error"
              size="sm"
              disabled={!selectedItem || form.isDeleting}
              onClick={form.delete}
            >
              {form.isDeleting ? "삭제 중" : "삭제"}
            </Button>
          </div>
        </div>

        {form.errorMessage ? (
          <p className="mt-3 text-xs text-destructive">{form.errorMessage}</p>
        ) : null}
      </div>

      {form.mode ? (
        <form
          className="grid gap-4 border-b border-border bg-surface-soft p-4 md:grid-cols-2"
          onSubmit={form.submit}
        >
          <div className="md:col-span-2 text-sm font-semibold text-foreground">
            {form.mode === "create" ? "코드 등록" : "코드 수정"}
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">코드</span>
            <input
              {...form.fields.code}
              readOnly={form.mode === "edit"}
              className="h-[var(--control-height-sm)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground read-only:bg-surface-soft"
            />
            {form.errors.code ? (
              <span className="text-xs text-destructive">{form.errors.code}</span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">코드명</span>
            <input
              {...form.fields.name}
              className="h-[var(--control-height-sm)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground"
            />
            {form.errors.name ? (
              <span className="text-xs text-destructive">{form.errors.name}</span>
            ) : null}
          </label>

          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-foreground">설명</span>
            <textarea
              {...form.fields.description}
              rows={2}
              className="resize-none rounded-sm border border-border-strong bg-card px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">정렬순서</span>
            <input
              {...form.fields.sortOrder}
              type="number"
              min={0}
              className="h-[var(--control-height-sm)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground"
            />
            {form.errors.sortOrder ? (
              <span className="text-xs text-destructive">
                {form.errors.sortOrder}
              </span>
            ) : null}
          </label>

          <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
            <input {...form.fields.enabled} type="checkbox" className="size-4" />
            사용
          </label>

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button size="sm" onClick={form.cancel}>
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={form.isPending}
            >
              {form.isPending ? "저장 중" : "저장"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="p-4">
        <DataGrid
          rows={items}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          emptyMessage={emptyMessage}
          selectedRowKey={selectedItem?.id ?? null}
          onRowClick={onSelect}
        />
      </div>
    </section>
  )
}
