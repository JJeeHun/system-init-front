import type { FormEventHandler } from "react"
import { useAppTranslation } from "@/shared/i18n"
import type { UseFormRegisterReturn } from "react-hook-form"

import { CommonCodeGroupOption } from "@/features/common-code/components/CommonCodeGroupOption"
import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"
import { Switch } from "@/shared/components/ui/switch"
import { Skeleton } from "@/shared/components/ui/skeleton"
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
  const { t } = useAppTranslation()
  if (loadErrorMessage) {
    return (
      <div role="alert" className="rounded-md border border-destructive bg-destructive-soft p-3 text-sm text-destructive">
        {loadErrorMessage}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div role="status" aria-label={t("common-code:group.loading")} className="grid gap-2 p-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="grid gap-2 rounded-md border border-border p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="p-3 text-sm text-foreground-soft">
        {t("common-code:group.empty")}
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
  const { t } = useAppTranslation()
  if (!show) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.isPending) form.cancel()
      }}
      title={t(form.mode === "create" ? "common-code:group.create" : "common-code:group.edit")}
    >
      <DefaultForm onSubmit={form.submit}>
        <Field required label={t("common-code:group.fields.code")} htmlFor="common-code-group-code" error={form.errors.code}>
          <Input
            id="common-code-group-code"
            {...form.fields.code}
            readOnly={form.mode === "edit"}
            aria-invalid={Boolean(form.errors.code)}
          />
        </Field>

        <Field required label={t("common-code:group.fields.name")} htmlFor="common-code-group-name" error={form.errors.name}>
          <Input
            id="common-code-group-name"
            {...form.fields.name}
            aria-invalid={Boolean(form.errors.name)}
          />
        </Field>

        <Field label={t("common-code:fields.description")} htmlFor="common-code-group-description" className="@md:col-span-2 @4xl:col-span-4">
          <Textarea
            id="common-code-group-description"
            {...form.fields.description}
            rows={2}
          />
        </Field>

        <Field required label={t("common-code:fields.sortOrder")} htmlFor="common-code-group-sort-order" error={form.errors.sortOrder}>
          <Input
            id="common-code-group-sort-order"
            {...form.fields.sortOrder}
            type="number"
            min={0}
            aria-invalid={Boolean(form.errors.sortOrder)}
          />
        </Field>

        <Field label={t("common-code:fields.enabled")} htmlFor="common-code-group-enabled" orientation="horizontal">
          <Switch
            id="common-code-group-enabled"
            checked={form.fields.enabled.checked}
            onCheckedChange={form.fields.enabled.onCheckedChange}
          />
        </Field>

        <DefaultForm.Actions>
          <Button size="sm" disabled={form.isPending} onClick={form.cancel}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            type="submit"
            primary
            size="sm"
            loading={form.isPending}
          >
            {t("common:actions.save")}
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
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header
        title={t("common-code:group.title")}
        description={t("common-code:group.description")}
        actions={
          <>
            <Button primary size="sm" disabled={form.isPending || form.isDeleting} onClick={form.startCreate}>
              {t("common-code:group.create")}
            </Button>
            <Button
              size="sm"
              disabled={!selectedGroupId || form.isPending || form.isDeleting}
              onClick={form.startEdit}
            >
              {t("common:actions.edit")}
            </Button>
            <Button
              error
              size="sm"
              disabled={!selectedGroupId || form.isPending || form.isDeleting}
              onClick={form.delete}
              loading={form.isDeleting}
            >
              {form.isDeleting ? t("common:actions.deleting") : t("common:actions.delete")}
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
