import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { CommonCodeGroupOption } from "@/features/common-code/components/CommonCodeGroupOption"
import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DefaultForm } from "@/shared/layout/default-form"
import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/ui/button"

type CommonCodeGroupFormProps = {
  mode: "create" | "edit" | null
  fields: {
    code: UseFormRegisterReturn
    name: UseFormRegisterReturn
    description: UseFormRegisterReturn
    enabled: {
      checked: boolean
      onCheckedChange: (checked: boolean) => void
    }
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
            <Button primary size="sm" onClick={form.startCreate}>
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
        <div className="border-b border-border bg-surface-soft">
          <div className="px-4 pt-4 text-sm font-semibold text-foreground">
            {form.mode === "create" ? "그룹 등록" : "그룹 수정"}
          </div>

          <DefaultForm onSubmit={form.submit}>
            <Field label="그룹 코드" htmlFor="common-code-group-code" error={form.errors.code}>
              <Input
                id="common-code-group-code"
                {...form.fields.code}
                readOnly={form.mode === "edit"}
                aria-invalid={Boolean(form.errors.code)}
              />
            </Field>

            <Field label="그룹명" htmlFor="common-code-group-name" error={form.errors.name}>
              <Input
                id="common-code-group-name"
                {...form.fields.name}
                aria-invalid={Boolean(form.errors.name)}
              />
            </Field>

            <Field label="설명" htmlFor="common-code-group-description" className="@md:col-span-2 @4xl:col-span-4">
              <Textarea
                id="common-code-group-description"
                {...form.fields.description}
                rows={2}
              />
            </Field>

            <Field label="정렬순서" htmlFor="common-code-group-sort-order" error={form.errors.sortOrder}>
              <Input
                id="common-code-group-sort-order"
                {...form.fields.sortOrder}
                type="number"
                min={0}
                aria-invalid={Boolean(form.errors.sortOrder)}
              />
            </Field>

            <Field label="사용" htmlFor="common-code-group-enabled" orientation="horizontal">
              <Checkbox
                id="common-code-group-enabled"
                checked={form.fields.enabled.checked}
                onCheckedChange={(checked) =>
                  form.fields.enabled.onCheckedChange(checked === true)
                }
              />
            </Field>
            <DefaultForm.Actions>
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
            </DefaultForm.Actions>
          </DefaultForm>
        </div>
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
          groups.map((group) => (
            <CommonCodeGroupOption
              key={group.id}
              group={group}
              selected={group.id === selectedGroupId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </section>
  )
}
