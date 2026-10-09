import { Controller } from "react-hook-form"
import { useAppTranslation } from "@/shared/i18n"

import type { useUserManagement } from "@/features/user/hooks/use-user-management"
import type { UserAccount, UserRoleCode } from "@/features/user/types/user-management.types"
import { Input } from "@/shared/components/ui/input"
import { Switch } from "@/shared/components/ui/switch"
import { DefaultForm } from "@/shared/layout/default-form"
import { Button } from "@/shared/ui/button"
import type { DataGridColumn } from "@/shared/ui/data-grid"
import { PaginatedDataGrid } from "@/shared/ui/paginated-data-grid"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { SearchField } from "@/shared/ui/search-field"
import { SearchPanel } from "@/shared/ui/search-panel"
import { Select } from "@/shared/ui/select"

type Management = ReturnType<typeof useUserManagement>

function UserFilters({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const { searchForm } = management
  return (
    <SearchPanel onSearch={management.search} onReset={management.resetSearch} loading={management.isFetching}>
      <div className="min-w-0 w-full sm:w-72">
        <Field label={t("user:filters.keyword")} htmlFor="user-search-keyword">
          <Controller control={searchForm.control} name="keyword" render={({ field }) => (
            <SearchField id="user-search-keyword" value={field.value} onValueChange={field.onChange} placeholder={t("user:filters.keywordPlaceholder")} />
          )} />
        </Field>
      </div>
      <div className="min-w-0 w-full sm:w-40">
        <Field label={t("user:fields.status")} htmlFor="user-search-status">
          <Controller control={searchForm.control} name="status" render={({ field }) => (
            <Select id="user-search-status" value={field.value} onValueChange={field.onChange} options={[
              { value: "all", label: t("user:filters.all") },
              { value: "enabled", label: t("common:labels.enabled") },
              { value: "disabled", label: t("common:labels.disabled") },
            ]} />
          )} />
        </Field>
      </div>
      <div className="min-w-0 w-full sm:w-40">
        <Field label={t("user:fields.role")} htmlFor="user-search-role">
          <Controller control={searchForm.control} name="role" render={({ field }) => (
            <Select id="user-search-role" value={field.value} onValueChange={field.onChange} options={[
              { value: "all", label: t("user:filters.all") },
              { value: "ADMIN", label: t("user:roles.ADMIN") },
              { value: "STAFF", label: t("user:roles.STAFF") },
            ]} />
          )} />
        </Field>
      </div>
    </SearchPanel>
  )
}

function UserEditor({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const { mode, form, saving } = management
  if (!mode) return null
  return (
    <Dialog
      open
      title={t(mode === "create" ? "user:actions.createTitle" : "user:actions.editTitle")}
      onOpenChange={open => { if (!open && !saving) management.cancel() }}
    >
      <DefaultForm onSubmit={management.submit}>
        <Field required label={t("user:fields.id")} htmlFor="user-editor-id" error={form.formState.errors.id?.message}>
          <Input id="user-editor-id" readOnly={mode === "edit"} aria-invalid={!!form.formState.errors.id}
            {...form.register("id", { required: t("user:validation.idRequired"), pattern: { value: /^[a-zA-Z0-9_-]{3,30}$/, message: t("user:validation.idFormat") } })} />
        </Field>
        <Field required label={t("user:fields.name")} htmlFor="user-editor-name" error={form.formState.errors.name?.message}>
          <Input id="user-editor-name" aria-invalid={!!form.formState.errors.name}
            {...form.register("name", { required: t("user:validation.nameRequired") })} />
        </Field>
        <Field required label={t("user:fields.email")} htmlFor="user-editor-email" error={form.formState.errors.email?.message}>
          <Input id="user-editor-email" type="email" aria-invalid={!!form.formState.errors.email}
            {...form.register("email", { required: t("user:validation.emailRequired"), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("user:validation.emailFormat") } })} />
        </Field>
        <Field label={t("user:fields.center")} htmlFor="user-editor-center">
          <Controller control={form.control} name="center" render={({ field }) => (
            <Select id="user-editor-center" value={field.value} onValueChange={field.onChange} options={[
              { value: "SEOUL", label: t("user:centers.SEOUL") },
              { value: "BUSAN", label: t("user:centers.BUSAN") },
            ]} />
          )} />
        </Field>
        <Field label={t("user:fields.role")} htmlFor="user-editor-role">
          <Controller control={form.control} name="role" render={({ field }) => (
            <Select id="user-editor-role" value={field.value} onValueChange={field.onChange} options={[
              { value: "ADMIN", label: t("user:roles.ADMIN") },
              { value: "STAFF", label: t("user:roles.STAFF") },
            ]} />
          )} />
        </Field>
        <Field label={t("user:fields.status")} htmlFor="user-editor-enabled" orientation="horizontal">
          <Controller control={form.control} name="enabled" render={({ field }) => (
            <Switch id="user-editor-enabled" checked={field.value} onCheckedChange={field.onChange} />
          )} />
        </Field>
        <DefaultForm.Actions>
          <Button size="sm" disabled={saving} onClick={management.cancel}>{t("common:actions.cancel")}</Button>
          <Button size="sm" type="submit" primary loading={saving}>{t("common:actions.save")}</Button>
        </DefaultForm.Actions>
      </DefaultForm>
    </Dialog>
  )
}

function UserList({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const selected = management.selected
  const columns = [
    { key: "id", header: t("user:fields.id"), size: "md" },
    { key: "name", header: t("user:fields.name"), size: "md" },
    { key: "email", header: t("user:fields.email"), size: "fill" },
    { key: "center", header: t("user:fields.center"), size: "lg",
      format: (value: unknown) => t(`user:centers.${value}`) },
    { key: "role", header: t("user:fields.role"), size: "md",
      format: (value: unknown) => t(`user:roles.${value as UserRoleCode}`) },
    { key: "enabled", header: t("user:fields.status"), size: "sm", align: "center",
      format: (value: unknown) => t(value === true ? "common:labels.enabled" : "common:labels.disabled") },
  ] satisfies DataGridColumn<UserAccount>[]

  return (
    <Panel>
      <Panel.Header
        title={t("user:list.title")}
        description={t("user:list.count", { count: management.totalCount })}
        errorMessage={management.loadError}
        actions={
          <>
            <Button primary size="sm" disabled={management.saving || management.statusPending} onClick={management.startCreate}>
              {t("user:actions.create")}
            </Button>
            <Button size="sm" disabled={!selected || management.saving || management.statusPending} onClick={management.startEdit}>
              {t("common:actions.edit")}
            </Button>
            <Button size="sm" error={!!selected?.enabled} disabled={!selected || management.saving || management.statusPending}
              loading={management.statusPending} onClick={() => void management.toggleEnabled()}>
              {t(selected?.enabled ? "user:actions.disable" : "user:actions.enable")}
            </Button>
          </>
        }
      />
      <Panel.Content>
        <PaginatedDataGrid
          rows={management.users}
          page={management.page}
          pageSize={management.pageSize}
          totalCount={management.totalCount}
          onPageChange={management.changePage}
          onPageSizeChange={management.changePageSize}
          paginationDisabled={management.isFetching}
          columns={columns}
          rowKey="id"
          selectedRowKey={selected?.id ?? null}
          onRowClick={management.selectUser}
          loading={management.isLoading}
          emptyMessage={t("user:list.empty")}
        />
      </Panel.Content>
    </Panel>
  )
}

export function UserManagementPanel({ management }: { management: Management }) {
  return (
    <div className="grid min-w-0 gap-content">
      <UserFilters management={management} />
      <UserList management={management} />
      <UserEditor management={management} />
    </div>
  )
}
