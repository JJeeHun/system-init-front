import { Controller } from "react-hook-form"

import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { useRoleManagement } from "@/features/role/hooks/use-role-management"
import type { RoleAction } from "@/features/role/types/role-management.types"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Input } from "@/shared/components/ui/input"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Textarea } from "@/shared/components/ui/textarea"
import { useAppTranslation } from "@/shared/i18n"
import { DefaultForm } from "@/shared/layout/default-form"
import { Button } from "@/shared/ui/button"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { SearchField } from "@/shared/ui/search-field"
import { SearchPanel } from "@/shared/ui/search-panel"

type Management = ReturnType<typeof useRoleManagement>
const ACTIONS: RoleAction[] = ["view", "create", "edit", "delete"]

function RoleSearch({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  return (
    <SearchPanel onSearch={management.search} onReset={management.resetSearch}>
      <div className="w-full min-w-0 sm:w-72">
        <Field label={t("role:fields.search")} htmlFor="role-search">
          <Controller control={management.searchForm.control} name="keyword" render={({ field }) => (
            <SearchField id="role-search" value={field.value} onValueChange={field.onChange} placeholder={t("role:fields.searchPlaceholder")} />
          )} />
        </Field>
      </div>
    </SearchPanel>
  )
}

function RoleList({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header title={t("role:list.title")} description={t("role:list.description")}
        errorMessage={management.rolesError ? t("role:messages.rolesError") : null}
        actions={
          <>
            <Button primary size="sm" disabled={management.busy} onClick={management.startCreate}>{t("role:actions.add")}</Button>
            <Button size="sm" disabled={!management.selected || management.busy} onClick={management.startEdit}>{t("common:actions.edit")}</Button>
            <Button size="sm" error disabled={!management.canDelete || management.busy} onClick={() => void management.deleteSelected()}>
              {t("common:actions.delete")}
            </Button>
          </>
        } />
      <Panel.Content>
        {management.rolesLoading ? <p role="status" className="text-sm text-foreground-soft">{t("common:states.loading")}</p> :
          management.roles.length === 0 ? <p className="text-sm text-foreground-soft">{t("role:list.empty")}</p> : (
            <ScrollArea className="h-72 min-w-0 lg:h-[var(--layout-grid-height)]" type="always">
              <div className="grid gap-2 pr-2">
                {management.roles.map(role => (
                  <Button key={role.id} size="sm" primary={role.id === management.selected?.id}
                    aria-pressed={role.id === management.selected?.id}
                    onClick={() => void management.selectRole(role.id)} disabled={management.busy}>
                    <span className="flex w-full min-w-0 items-center justify-between gap-2 text-left">
                      <span className="truncate">{role.name}</span>
                      <span className="shrink-0 text-xs opacity-75">{role.id}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        <p className="mt-3 text-xs text-foreground-soft">{t("role:list.builtinNotice")}</p>
      </Panel.Content>
    </Panel>
  )
}

function PermissionCheckbox({ management, menu, action }: {
  management: Management
  menu: MenuRecord
  action: RoleAction
}) {
  const { t } = useAppTranslation()
  const id = "role-permission-" + menu.id + "-" + action
  const disabled = management.busy || management.permissionsLoading || management.menusLoading ||
    (action !== "view" && !management.isAllowed(menu.id, "view"))
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs text-foreground">
      <Checkbox id={id} checked={management.isAllowed(menu.id, action)} disabled={disabled}
        onCheckedChange={checked => management.togglePermission(menu.id, action, checked === true)} />
      {t("role:permissions." + action)}
    </label>
  )
}

function PermissionTree({ management, parentId, depth = 0 }: {
  management: Management
  parentId: string | null
  depth?: number
}) {
  const { t } = useAppTranslation()
  const menus = management.menus.filter(menu => menu.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
  return (
    <div className={depth > 0 ? "ml-3 border-l border-border pl-3" : "grid gap-3"}>
      {menus.map(menu => menu.kind === "group" ? (
        <section key={menu.id} className="grid gap-2">
          <h3 className="text-sm font-semibold text-foreground">{getMenuLabel(menu, t)}</h3>
          <PermissionTree management={management} parentId={menu.id} depth={depth + 1} />
        </section>
      ) : (
        <div key={menu.id} className="grid gap-2 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{getMenuLabel(menu, t)}</span>
            {!management.isAllowed(menu.id, "view") ? (
              <span className="text-xs text-foreground-soft">{t("role:permissions.noAccess")}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {ACTIONS.map(action => <PermissionCheckbox key={action} management={management} menu={menu} action={action} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function RolePermissionPanel({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const selected = management.selected
  const accessibleMenus = management.menus.filter(menu => menu.kind === "page" && management.isAllowed(menu.id, "view")).length
  return (
    <Panel>
      <Panel.Header
        title={t("role:permissions.title")}
        description={selected ? t("role:permissions.selected", { name: selected.name }) : t("role:permissions.choose")}
        errorMessage={management.menusError || management.permissionsError ? t("role:messages.permissionsError") : null}
        actions={selected ? (
          <>
            <Button size="sm" onClick={management.cancelPermissions} disabled={!management.permissionDirty || management.busy}>{t("common:actions.cancel")}</Button>
            <Button primary size="sm" onClick={management.savePermissions} loading={management.savingPermissions}
              disabled={!management.permissionDirty || management.busy}>{t("common:actions.save")}</Button>
          </>
        ) : undefined}
      />
      <Panel.Content>
        {!selected ? <p className="text-sm text-foreground-soft">{t("role:permissions.choose")}</p> :
          management.menusLoading || management.permissionsLoading ? (
            <p role="status" className="text-sm text-foreground-soft">{t("common:states.loading")}</p>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-sm font-medium text-foreground">{t("role:preview.title")}</p>
                <p className="mt-1 text-xs text-foreground-soft">
                  {accessibleMenus > 0 ? t("role:preview.allowed", { count: accessibleMenus }) : t("role:preview.denied")}
                </p>
                <p className="mt-1 text-xs text-foreground-soft">{t("role:preview.notice")}</p>
              </div>
              {management.menus.some(menu => menu.kind === "page") ? (
                <ScrollArea type="always" className="h-80 min-w-0 lg:h-[var(--layout-grid-height)]">
                  <div className="grid gap-3 pr-2">
                    <PermissionTree management={management} parentId={null} />
                  </div>
                </ScrollArea>
              ) : <p className="text-sm text-foreground-soft">{t("role:permissions.empty")}</p>}
              <p className="text-xs text-foreground-soft">{t("role:permissions.saveNotice")}</p>
            </div>
          )}
      </Panel.Content>
    </Panel>
  )
}

function RoleEditor({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const { roleForm, mode, savingRole } = management
  if (!mode) return null
  return (
    <Dialog open title={t(mode === "create" ? "role:actions.createTitle" : "role:actions.editTitle")}
      onOpenChange={open => { if (!open && !savingRole) management.cancel() }}>
      <DefaultForm onSubmit={management.submit}>
        <Field required label={t("role:fields.id")} htmlFor="role-editor-id" error={roleForm.formState.errors.id?.message}>
          <Input id="role-editor-id" readOnly={mode === "edit"} aria-invalid={!!roleForm.formState.errors.id}
            {...roleForm.register("id", { required: t("role:validation.idRequired"),
              pattern: { value: /^[A-Z][A-Z0-9_]{1,29}$/, message: t("role:validation.idFormat") } })} />
        </Field>
        <Field required label={t("role:fields.name")} htmlFor="role-editor-name" error={roleForm.formState.errors.name?.message}>
          <Input id="role-editor-name" aria-invalid={!!roleForm.formState.errors.name}
            {...roleForm.register("name", { required: t("role:validation.nameRequired") })} />
        </Field>
        <div className="col-span-full">
          <Field label={t("role:fields.description")} htmlFor="role-editor-description">
            <Textarea id="role-editor-description" {...roleForm.register("description")} />
          </Field>
        </div>
        <DefaultForm.Actions>
          <Button size="sm" disabled={savingRole} onClick={management.cancel}>{t("common:actions.cancel")}</Button>
          <Button size="sm" type="submit" primary loading={savingRole}>{t("common:actions.save")}</Button>
        </DefaultForm.Actions>
      </DefaultForm>
    </Dialog>
  )
}

export function RoleManagementPanel({ management }: { management: Management }) {
  return (
    <div className="grid min-w-0 gap-content">
      <RoleSearch management={management} />
      <section className="grid min-w-0 grid-cols-1 items-start gap-content xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <RoleList management={management} />
        <RolePermissionPanel management={management} />
      </section>
      <RoleEditor management={management} />
    </div>
  )
}
