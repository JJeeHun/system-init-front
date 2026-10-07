import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"
import { Button } from "@/shared/ui/button"

type CommonCodeGroupFormProps = {
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

type CommonCodeGroupPanelProps = {
  groups: CommonCodeGroup[]
  selectedGroupId: string | null
  isLoading: boolean
  loadErrorMessage: string | null
  onSelect: (group: CommonCodeGroup) => void
  form: CommonCodeGroupFormProps
}

export function CommonCodeGroupPanel({
  groups,
  selectedGroupId,
  isLoading,
  loadErrorMessage,
  onSelect,
  form,
}: CommonCodeGroupPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-panel">
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              코드 그룹
            </h2>
            <p className="mt-1 text-xs text-foreground-soft">
              Master · 고정 1Depth
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              primary
              size="sm"
              onClick={form.startCreate}
            >
              그룹 등록
            </Button>
            <Button
              size="sm"
              disabled={!selectedGroupId}
              onClick={form.startEdit}
            >
              수정
            </Button>
            <Button
              error
              size="sm"
              disabled={!selectedGroupId || form.isDeleting}
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
          className="grid gap-4 border-b border-border bg-surface-soft p-4"
          onSubmit={form.submit}
        >
          <div className="text-sm font-semibold text-foreground">
            {form.mode === "create" ? "그룹 등록" : "그룹 수정"}
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">그룹 코드</span>
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
            <span className="text-xs font-medium text-foreground">그룹명</span>
            <input
              {...form.fields.name}
              className="h-[var(--control-height-sm)] rounded-sm border border-border-strong bg-card px-3 text-sm text-foreground"
            />
            {form.errors.name ? (
              <span className="text-xs text-destructive">{form.errors.name}</span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-foreground">설명</span>
            <textarea
              {...form.fields.description}
              rows={2}
              className="resize-none rounded-sm border border-border-strong bg-card px-3 py-2 text-sm text-foreground"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground">
                정렬순서
              </span>
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
              <input
                {...form.fields.enabled}
                type="checkbox"
                className="size-4"
              />
              사용
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={form.cancel}>
              취소
            </Button>
            <Button
              type="submit"
              primary
              size="sm"
              disabled={form.isPending}
            >
              {form.isPending ? "저장 중" : "저장"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid max-h-96 gap-2 overflow-y-auto p-3">
        {loadErrorMessage ? (
          <div className="rounded-md border border-destructive bg-destructive-soft p-3 text-sm text-destructive">
            {loadErrorMessage}
          </div>
        ) : isLoading ? (
          <div className="p-3 text-sm text-foreground-soft">
            그룹을 불러오는 중입니다.
          </div>
        ) : groups.length === 0 ? (
          <div className="p-3 text-sm text-foreground-soft">
            등록된 코드 그룹이 없습니다.
          </div>
        ) : (
          groups.map((group) => {
            const selected = group.id === selectedGroupId

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelect(group)}
                className={[
                  "grid gap-1 rounded-md border p-3 text-left transition-colors",
                  selected
                    ? "border-primary-border bg-primary-soft"
                    : "border-border bg-card hover:bg-surface-soft",
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-foreground">
                    {group.name}
                  </strong>
                  <span
                    className={
                      group.enabled
                        ? "text-xs font-medium text-success"
                        : "text-xs font-medium text-foreground-faint"
                    }
                  >
                    {group.enabled ? "사용" : "미사용"}
                  </span>
                </span>
                <span className="text-xs font-semibold text-primary">
                  {group.code}
                </span>
                {group.description ? (
                  <span className="line-clamp-2 text-xs text-foreground-soft">
                    {group.description}
                  </span>
                ) : null}
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
