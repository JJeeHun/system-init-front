import type { FormEventHandler } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { CommonCodeGroupOption } from "@/features/common-code/components/CommonCodeGroupOption"
import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"
import { Switch } from "@/shared/components/ui/switch"
import { DefaultForm } from "@/shared/layout/default-form"
import { Button } from "@/shared/ui/button"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

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

type GroupListProps = Pick<
  CommonCodeGroupPanelProps,
  "groups" | "selectedGroupId" | "isLoading" | "loadErrorMessage" | "onSelect"
>

const GroupList = ({
  groups,
  selectedGroupId,
  isLoading,
  loadErrorMessage,
  onSelect,
}: GroupListProps) => {
  if (loadErrorMessage) {
    return (
      <div role="alert" className="rounded-md border border-destructive bg-destructive-soft p-3 text-sm text-destructive">
        {loadErrorMessage}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-3 text-sm text-foreground-soft">
        그룹을 불러오는 중입니다.
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="p-3 text-sm text-foreground-soft">
        등록된 코드 그룹이 없습니다.
      </div>
    )
  }

  return (
    <>
      {groups.map((group) => (
        <CommonCodeGroupOption
          key={group.id}
          group={group}
          selected={group.id === selectedGroupId}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

const GroupFormDialog = ({ show, form }: { show: boolean; form: CommonCodeGroupFormProps }) => {
  if (!show) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.isPending) form.cancel()
      }}
      title={form.mode === "create" ? "그룹 등록" : "그룹 수정"}
    >
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
          <Switch
            id="common-code-group-enabled"
            checked={form.fields.enabled.checked}
            onCheckedChange={form.fields.enabled.onCheckedChange}
          />
        </Field>

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

export function CommonCodeGroupPanel({
  groups,
  selectedGroupId,
  isLoading,
  loadErrorMessage,
  onSelect,
  form,
}: CommonCodeGroupPanelProps) {
  return (
    <Panel>
      <Panel.Header
        title="코드 그룹"
        description="Master · 고정 1Depth"
        actions={
          <>
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
          </>
        }
      />

      <GroupFormDialog show={!!form.mode} form={form} />

      <Panel.Content>
        <ScrollArea type="always" className="h-36 min-w-0 sm:h-64">
          <div className="grid min-w-0 gap-1.5 pr-2 [&>button]:w-full [&>button]:min-w-0">
            <GroupList
              groups={groups}
              selectedGroupId={selectedGroupId}
              isLoading={isLoading}
              loadErrorMessage={loadErrorMessage}
              onSelect={onSelect}
            />
          </div>
        </ScrollArea>
      </Panel.Content>
    </Panel>
  )
}
