import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import { Controller } from "react-hook-form"

import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { useRoleManagement } from "@/features/role/hooks/use-role-management"
import type { RoleAction } from "@/features/role/types/role-management.types"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
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

function RoleListContent({ management }: { management: Management }) {
  const { t } = useAppTranslation()

  if (management.rolesError) {
    return <p role="alert" className="text-sm text-destructive">{t("role:messages.rolesError")}</p>
  }
  if (management.rolesLoading) {
    return <p role="status" className="text-sm text-foreground-soft">{t("common:states.loading")}</p>
  }
  if (management.roles.length === 0) {
    return <p className="text-sm text-foreground-soft">{t("role:list.empty")}</p>
  }

  return (
    <ScrollArea className="h-72 min-w-0 lg:h-[var(--layout-grid-height)]" type="always">
      <div className="grid gap-2 pr-2">
        {management.roles.map(role => (
          <Button key={role.id} size="sm" primary={role.id === management.selected?.id}
            aria-pressed={role.id === management.selected?.id}
            onClick={() => void management.selectRole(role.id)} disabled={management.busy}>
            <span className="flex w-full min-w-0 items-center justify-between gap-2 text-left">
              <span className="truncate">{role.name}</span>
              <span className="shrink-0 text-xs opacity-75">{role.id} · {t("role:fields.level")} {role.level}</span>
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

function RoleList({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header title={t("role:list.title")} description={t("role:list.description")}
        actions={
          <>
            <Button primary size="sm" disabled={!management.canCreate || management.busy} onClick={management.startCreate}>{t("role:actions.add")}</Button>
            <Button size="sm" disabled={!management.selected || management.busy} onClick={management.startEdit}>{t("common:actions.edit")}</Button>
            <Button size="sm" error disabled={!management.canDelete || management.busy} onClick={() => void management.deleteSelected()}>
              {t("common:actions.delete")}
            </Button>
          </>
        } />
      <Panel.Content>
        <RoleListContent management={management} />
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
  const otherProtectedActions = action === "view" && (["create", "edit", "delete"] as RoleAction[]).some(item =>
    management.isAllowed(menu.id, item) && !management.canGrant(menu.id, item))
  const disabled = management.busy || management.permissionsLoading || management.menusLoading ||
    !management.canGrant(menu.id, action) || otherProtectedActions ||
    (action !== "view" && !management.isAllowed(menu.id, "view"))
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs text-foreground">
      <Checkbox id={id} checked={management.isAllowed(menu.id, action)} disabled={disabled}
        onCheckedChange={checked => management.togglePermission(menu.id, action, checked === true)} />
      {t("role:permissions." + action)}
    </label>
  )
}

type MenuTreeProps = {
  management: Management
  parentId: string | null
  selectedMenuId: string
  onSelectMenu: (menuId: string) => void
  depth: number
}

function MenuTreeNode({ management, menu, selectedMenuId, onSelectMenu, depth }: {
  management: Management
  menu: MenuRecord
  selectedMenuId: string
  onSelectMenu: (menuId: string) => void
  depth: number
}) {
  const { t } = useAppTranslation()

  if (menu.kind === "group") {
    return (
      <Collapsible defaultOpen className="group/menu grid gap-1">
        <CollapsibleTrigger asChild>
          <Button size="sm" title={getMenuLabel(menu, t)}>
            <span className="flex w-full min-w-0 items-center gap-2 text-left">
              <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 transition-transform group-data-[state=open]/menu:rotate-90" />
              <span className="truncate font-semibold">{getMenuLabel(menu, t)}</span>
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-3 grid gap-1 border-l border-border pl-3">
            <MenuTree management={management} parentId={menu.id} depth={depth + 1}
              selectedMenuId={selectedMenuId} onSelectMenu={onSelectMenu} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Button size="sm" primary={menu.id === selectedMenuId}
      aria-pressed={menu.id === selectedMenuId}
      onClick={() => onSelectMenu(menu.id)} disabled={management.busy}>
      <span className="flex w-full min-w-0 items-center gap-2 text-left">
        <span className="truncate">{getMenuLabel(menu, t)}</span>
        {!management.isAllowed(menu.id, "view") && (
          <span className="ml-auto shrink-0 text-xs opacity-75">{t("role:permissions.noAccess")}</span>
        )}
      </span>
    </Button>
  )
}

function MenuTree({ management, parentId, selectedMenuId, onSelectMenu, depth }: MenuTreeProps) {
  const menus = management.menus.filter(menu => menu.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))

  return (
    <div className={depth === 0 ? "grid gap-2" : "grid gap-1"}>
      {menus.map(menu => (
        <MenuTreeNode key={menu.id} management={management} menu={menu} depth={depth}
          selectedMenuId={selectedMenuId} onSelectMenu={onSelectMenu} />
      ))}
    </div>
  )
}

function MenuPermissionEditor({ management, menu }: { management: Management; menu: MenuRecord }) {
  const { t } = useAppTranslation()
  const hasAccess = management.isAllowed(menu.id, "view")

  return (
    <section className="min-w-0 rounded-md border border-border p-3">
      <h3 className="text-sm font-semibold text-foreground">{getMenuLabel(menu, t)}</h3>
      <p className="mt-1 text-xs text-foreground-soft">{t("role:permissions.selectedMenuNotice")}</p>
      {!hasAccess && (
        <p className="mt-3 text-xs text-foreground-soft">{t("role:permissions.noAccess")}</p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {ACTIONS.map(action => <PermissionCheckbox key={action} management={management} menu={menu} action={action} />)}
      </div>
    </section>
  )
}

function RolePermissionContent({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)

  if (!management.selected) {
    return <p className="text-sm text-foreground-soft">{t("role:permissions.choose")}</p>
  }
  if (management.menusError || management.permissionsError) {
    return <p role="alert" className="text-sm text-destructive">{t("role:messages.permissionsError")}</p>
  }
  if (management.menusLoading || management.permissionsLoading) {
    return <p role="status" className="text-sm text-foreground-soft">{t("common:states.loading")}</p>
  }
  const selectedMenu = management.menus.find(menu => menu.id === selectedMenuId && menu.kind === "page")
    ?? management.menus.find(menu => menu.kind === "page")
  if (!selectedMenu) {
    return <p className="text-sm text-foreground-soft">{t("role:permissions.empty")}</p>
  }

  return (
    <div className="grid min-w-0 gap-3">
      <div className="grid min-w-0 gap-3 2xl:grid-cols-2">
        <nav aria-label={t("role:permissions.menuTreeTitle")} className="min-w-0 rounded-md border border-border p-3">
          <h3 className="mb-3 text-sm font-semibold text-foreground">{t("role:permissions.menuTreeTitle")}</h3>
          <ScrollArea type="always" className="h-72 min-w-0">
            <div className="pr-2">
              <MenuTree management={management} parentId={null} depth={0} selectedMenuId={selectedMenu.id}
                onSelectMenu={setSelectedMenuId} />
            </div>
          </ScrollArea>
        </nav>
        <MenuPermissionEditor management={management} menu={selectedMenu} />
      </div>
      <p className="text-xs text-foreground-soft">{t("role:permissions.saveNotice")}</p>
    </div>
  )
}

function RolePermissionPanel({ management }: { management: Management }) {
  const { t } = useAppTranslation()
  const selected = management.selected
  return (
    <Panel>
      <Panel.Header
        title={t("role:permissions.title")}
        description={selected ? t("role:permissions.selected", { name: selected.name }) : t("role:permissions.choose")}
        actions={selected ? (
          <>
            <Button size="sm" onClick={management.cancelPermissions} disabled={!management.permissionDirty || management.busy}>{t("common:actions.cancel")}</Button>
            <Button primary size="sm" onClick={management.savePermissions} loading={management.savingPermissions}
              disabled={!management.permissionDirty || management.busy}>{t("common:actions.save")}</Button>
          </>
        ) : undefined}
      />
      <Panel.Content>
        <RolePermissionContent management={management} />
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
