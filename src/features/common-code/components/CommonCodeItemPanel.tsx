import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import type {
  CommonCodeGroup,
  CommonCodeItem,
} from "@/features/common-code/types/common-code.types"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/ui/button"
import { DataGrid } from "@/shared/ui/data-grid"
import type { DataGridColumn } from "@/shared/ui/data-grid"

type CommonCodeItemFormProps = {
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
              primary
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
              error
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

          <Field data-invalid={Boolean(form.errors.code)}>
            <FieldLabel htmlFor="common-code-item-code">코드</FieldLabel>
            <Input
              id="common-code-item-code"
              {...form.fields.code}
              readOnly={form.mode === "edit"}
              aria-invalid={Boolean(form.errors.code)}
            />
            <FieldError>{form.errors.code}</FieldError>
          </Field>

          <Field data-invalid={Boolean(form.errors.name)}>
            <FieldLabel htmlFor="common-code-item-name">코드명</FieldLabel>
            <Input
              id="common-code-item-name"
              {...form.fields.name}
              aria-invalid={Boolean(form.errors.name)}
            />
            <FieldError>{form.errors.name}</FieldError>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="common-code-item-description">설명</FieldLabel>
            <Textarea
              id="common-code-item-description"
              {...form.fields.description}
              rows={2}
            />
          </Field>

          <Field data-invalid={Boolean(form.errors.sortOrder)}>
            <FieldLabel htmlFor="common-code-item-sort-order">
              정렬순서
            </FieldLabel>
            <Input
              id="common-code-item-sort-order"
              {...form.fields.sortOrder}
              type="number"
              min={0}
              aria-invalid={Boolean(form.errors.sortOrder)}
            />
            <FieldError>{form.errors.sortOrder}</FieldError>
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="common-code-item-enabled"
              checked={form.fields.enabled.checked}
              onCheckedChange={(checked) =>
                form.fields.enabled.onCheckedChange(checked === true)
              }
            />
            <FieldLabel htmlFor="common-code-item-enabled">사용</FieldLabel>
          </Field>

          <div className="flex justify-end gap-2 md:col-span-2">
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
