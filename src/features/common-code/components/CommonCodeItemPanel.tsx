import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import type {
  CommonCodeGroup,
  CommonCodeItem,
} from "@/features/common-code/types/common-code.types"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DefaultForm } from "@/shared/layout/default-form"
import { Button } from "@/shared/ui/button"
import { DataGrid } from "@/shared/ui/data-grid"
import type { DataGridColumn } from "@/shared/ui/data-grid"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

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

const ItemFormDialog = ({ show, form }: { show: boolean; form: CommonCodeItemFormProps }) => {
  if (!show) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.isPending) form.cancel()
      }}
      title={form.mode === "create" ? "코드 등록" : "코드 수정"}
    >
      <DefaultForm onSubmit={form.submit}>
        <Field label="코드" htmlFor="common-code-item-code" error={form.errors.code}>
          <Input
            id="common-code-item-code"
            {...form.fields.code}
            readOnly={form.mode === "edit"}
            aria-invalid={Boolean(form.errors.code)}
          />
        </Field>

        <Field label="코드명" htmlFor="common-code-item-name" error={form.errors.name}>
          <Input
            id="common-code-item-name"
            {...form.fields.name}
            aria-invalid={Boolean(form.errors.name)}
          />
        </Field>

        <Field label="설명" htmlFor="common-code-item-description" className="@md:col-span-2">
          <Textarea
            id="common-code-item-description"
            {...form.fields.description}
            rows={2}
          />
        </Field>

        <Field label="정렬순서" htmlFor="common-code-item-sort-order" error={form.errors.sortOrder}>
          <Input
            id="common-code-item-sort-order"
            {...form.fields.sortOrder}
            type="number"
            min={0}
            aria-invalid={Boolean(form.errors.sortOrder)}
          />
        </Field>

        <Field label="사용" htmlFor="common-code-item-enabled" orientation="horizontal">
          <Checkbox
            id="common-code-item-enabled"
            checked={form.fields.enabled.checked}
            onCheckedChange={(checked) =>
              form.fields.enabled.onCheckedChange(checked === true)
            }
          />
        </Field>

        {form.errorMessage ? (
          <p role="alert" className="col-span-full text-sm text-destructive">
            {form.errorMessage}
          </p>
        ) : null}

        <DefaultForm.Actions>
          <Button size="sm" disabled={form.isPending} onClick={form.cancel}>
            취소
          </Button>
          <Button
            type="submit"
            primary
            size="sm"
            loading={form.isPending}
          >
            저장
          </Button>
        </DefaultForm.Actions>
      </DefaultForm>
    </Dialog>
  )
}

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
    <Panel>
      <Panel.Header
        title="상세 코드"
        description={group ? `${group.code} · ${group.name}` : "Detail · 고정 2Depth"}
        errorMessage={form.mode ? null : form.errorMessage}
        actions={
          <>
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
          </>
        }
      />

      <ItemFormDialog show={!!form.mode} form={form} />

      <Panel.Content>
        <DataGrid
          rows={items}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          emptyMessage={emptyMessage}
          selectedRowKey={selectedItem?.id ?? null}
          onRowClick={onSelect}
        />
      </Panel.Content>
    </Panel>
  )
}
