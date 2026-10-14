import type { FormEventHandler } from "react"

import { useAppTranslation } from "@/shared/i18n"
import type { UseFormRegisterReturn } from "react-hook-form"

import type {
  CommonCodeGroup,
  CommonCodeItem,
} from "@/features/common-code/types/common-code.types"
import { Switch } from "@/shared/components/ui/switch"
import { DefaultForm } from "@/shared/layout/default-form"
import { Button } from "@/shared/ui/button"
import { CrudActions } from "@/shared/ui/crud-actions"
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


const ItemFormDialog = ({ show, form }: { show: boolean; form: CommonCodeItemFormProps }) => {
  const { t } = useAppTranslation()
  if (!show) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.isPending) form.cancel()
      }}
      title={t(form.mode === "create" ? "common-code:item.create" : "common-code:item.edit")}
    >
      <DefaultForm onSubmit={form.submit}>
        <Field required={form.mode === "create"} readOnly={form.mode === "edit"}
          description={form.mode === "edit" ? t("common:labels.immutableAfterCreate") : undefined}
          label={t("common-code:item.fields.code")} htmlFor="common-code-item-code" error={form.errors.code}>
          <Input
            id="common-code-item-code"
            {...form.fields.code}
            readOnly={form.mode === "edit"}
            aria-describedby={form.mode === "edit" ? "common-code-item-code-description" : undefined}
            aria-invalid={Boolean(form.errors.code)}
          />
        </Field>

        <Field required label={t("common-code:item.fields.name")} htmlFor="common-code-item-name" error={form.errors.name}>
          <Input
            id="common-code-item-name"
            {...form.fields.name}
            aria-invalid={Boolean(form.errors.name)}
          />
        </Field>

        <Field label={t("common-code:fields.description")} htmlFor="common-code-item-description" className="@md:col-span-2">
          <Textarea
            id="common-code-item-description"
            {...form.fields.description}
            rows={2}
          />
        </Field>

        <Field required label={t("common-code:fields.sortOrder")} htmlFor="common-code-item-sort-order" error={form.errors.sortOrder}>
          <Input
            id="common-code-item-sort-order"
            {...form.fields.sortOrder}
            type="number"
            min={0}
            aria-invalid={Boolean(form.errors.sortOrder)}
          />
        </Field>

        <Field label={t("common-code:fields.enabled")} htmlFor="common-code-item-enabled" orientation="horizontal">
          <Switch
            id="common-code-item-enabled"
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

export function CommonCodeItemPanel({
  group,
  items,
  selectedItem,
  isLoading,
  loadErrorMessage,
  onSelect,
  form,
}: CommonCodeItemPanelProps) {
  const { t } = useAppTranslation()
  const columns = [
    { key: "code", header: t("common-code:item.fields.code"), size: "md" },
    { key: "name", header: t("common-code:item.fields.name"), size: "lg" },
    { key: "sortOrder", header: t("common-code:fields.order"), size: "sm", align: "right" },
    {
      key: "enabled", header: t("common-code:fields.enabled"), size: "sm", align: "center",
      format: (value) => t(value === true ? "common:labels.enabled" : "common:labels.disabled"),
    },
    { key: "description", header: t("common-code:fields.description"), size: "fill" },
  ] satisfies DataGridColumn<CommonCodeItem>[]
  const emptyMessage = loadErrorMessage
    ? loadErrorMessage
    : group
      ? t("common-code:item.empty")
      : t("common-code:item.chooseGroup")

  return (
    <Panel>
      <Panel.Header
        title={t("common-code:item.title")}
        description={group ? `${group.code} · ${group.name}` : t("common-code:item.description")}
        actions={
          <CrudActions
            menuId="common-code"
            onCreate={form.startCreate}
            onEdit={form.startEdit}
            onDelete={form.delete}
            showEdit={selectedItem !== null}
            showDelete={selectedItem !== null}
            createDisabled={!group || form.isPending || form.isDeleting}
            editDisabled={form.isPending || form.isDeleting}
            deleteDisabled={form.isPending || form.isDeleting}
            deleteLoading={form.isDeleting}
          />
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
