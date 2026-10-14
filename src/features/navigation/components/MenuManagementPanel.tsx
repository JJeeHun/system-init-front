import { FolderIcon } from "lucide-react"

import { Controller, useWatch } from "react-hook-form"
import { useAppTranslation } from "@/shared/i18n"
import type { AppTranslate } from "@/shared/i18n"

import { MenuIcon } from "@/features/navigation/components/MenuIcon"
import { getMenuLabel } from "@/features/navigation/lib/navigation-menu"
import type { MenuInput, MenuRecord } from "@/features/navigation/types/menu-management.types"
import type { NavigationIconKey } from "@/features/navigation/types/navigation.types"
import type { useMenuManagement } from "@/features/navigation/hooks/use-menu-management"
import { Switch } from "@/shared/components/ui/switch"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Button } from "@/shared/ui/button"
import { CrudActions } from "@/shared/ui/crud-actions"
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { TreeControls, TreeView } from "@/shared/ui/tree"
import type { TreeViewNode } from "@/shared/ui/tree"
import { DefaultForm } from "@/shared/layout/default-form"
import { Skeleton } from "@/shared/components/ui/skeleton"

type MenuManagement = ReturnType<typeof useMenuManagement>
const ICON_OPTIONS: NavigationIconKey[] = ["activity", "boxes", "calendar", "clipboard", "code", "dashboard", "package", "receipt", "scan", "settings", "truck", "users"]

function sortByOrder(a: MenuRecord, b: MenuRecord) {
  return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)
}

function buildMenuTree(menus: readonly MenuRecord[], parentId: string | null, t: AppTranslate): TreeViewNode[] {
  return menus.filter(menu => menu.parentId === parentId).sort(sortByOrder).map(menu => {
    const label = getMenuLabel(menu, t)
    return {
      id: menu.id,
      label,
      title: menu.path || label,
      icon: menu.kind === "group" ? <FolderIcon className="size-4" /> : <MenuIcon name={menu.icon} />,
      trailingText: menu.enabled ? undefined : t("common:labels.disabled"),
      children: menu.kind === "group" ? buildMenuTree(menus, menu.id, t) : undefined,
    }
  })
}

function MenuTree({ management }: { management: MenuManagement }) {
  const { t } = useAppTranslation()
  return (
    <TreeView
      nodes={buildMenuTree(management.tree.filteredItems, null, t)}
      selectedId={management.tree.selectedId}
      collapsedIds={management.tree.collapsedIds}
      forceExpanded={management.tree.forceExpanded}
      disabled={management.saving || management.deleting}
      onSelect={id => {
        const menu = management.menus.find(item => item.id === id)
        if (menu) management.selectMenu(menu)
      }}
      onToggle={management.tree.toggleNode}
      expandLabel={label => t("navigation:management.expandGroup", { name: label })}
      collapseLabel={label => t("navigation:management.collapseGroup", { name: label })}
    />
  )
}

function MenuList({ management }: { management: MenuManagement }) {
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header
        title={t("navigation:management.treeTitle")}
        description={t("navigation:management.treeDescription")}
        actions={<CrudActions menuId="menu-management" onCreate={() => management.startCreate()}
          createLabel={t("navigation:management.addRoot")} createDisabled={management.saving || management.deleting} />}
      />
      <Panel.Content>
        <div className="mb-3">
          <TreeControls
            keyword={management.tree.keyword}
            onKeywordChange={management.tree.setKeyword}
            searchLabel={t("navigation:management.searchLabel")}
            searchPlaceholder={t("navigation:management.searchPlaceholder")}
            expandAll={management.tree.expandAll}
            collapseAll={management.tree.collapseAll}
            disabled={management.saving || management.deleting}
          />
        </div>
        {management.loadError ? <p role="alert" className="text-sm text-destructive">{management.loadError}</p> : null}
        {management.isLoading ? (
          <div role="status" aria-label={t("navigation:management.loading")} className="grid gap-2">
            {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}
          </div>
        ) : management.menus.length === 0 ? (
          <p className="text-sm text-foreground-soft">{t("navigation:management.empty")}</p>
        ) : management.tree.filteredItems.length === 0 ? (
          <p role="status" className="text-sm text-foreground-soft">{t("navigation:management.noSearchResults")}</p>
        ) : (
          <ScrollArea type="always" className="h-80 min-w-0 sm:h-[var(--layout-grid-height)]">
            <div className="min-w-0 pr-2">
              <MenuTree management={management} />
            </div>
          </ScrollArea>
        )}
      </Panel.Content>
    </Panel>
  )
}

function MenuDetails({ management }: { management: MenuManagement }) {
  const { t } = useAppTranslation()
  const selected = management.selected

  const parent = management.menus.find((menu) => menu.id === selected?.parentId)
  return (
    <Panel>
      <Panel.Header
        title={t("navigation:management.detailsTitle")}
        description={selected ? management.selectedPath : t("navigation:management.choose")}
        actions={selected ? (
          <CrudActions
            menuId="menu-management"
            onCreate={() => management.startCreate(selected.id)}
            onEdit={management.startEdit}
            onDelete={() => void management.deleteSelected()}
            showCreate={selected.kind === "group"}
            createLabel={t("navigation:management.addChild")}
            createDisabled={management.saving || management.deleting}
            editDisabled={management.saving || management.deleting}
            deleteDisabled={management.saving || management.deleting}
            deleteLoading={management.deleting}
          />
        ) : undefined}
      />
      <Panel.Content>
        {!selected ? (
          <p className="text-sm text-foreground-soft">{t("navigation:management.choose")}</p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            {([
              [t("navigation:management.fields.id"), selected.id],
              [t("navigation:management.fields.name"), getMenuLabel(selected, t)],
              [t("navigation:management.fields.kind"), t(`navigation:management.kinds.${selected.kind}`)],
              [t("navigation:management.fields.parent"), parent ? getMenuLabel(parent, t) : t("navigation:management.root")],
              [t("navigation:management.fields.path"), selected.path || "—"],
              [t("navigation:management.fields.icon"), selected.icon || "—"],
              [t("navigation:management.fields.sortOrder"), String(selected.sortOrder)],
              [t("navigation:management.fields.enabled"), t(selected.enabled ? "common:labels.enabled" : "common:labels.disabled")],
              [t("navigation:management.fields.scope"), t(`navigation:management.scopes.${selected.scope}`)],
            ] as const).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="mb-1 text-xs text-foreground-soft">{label}</dt>
                <dd className="break-all font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel.Content>
    </Panel>
  )
}

function MenuFormDialog({ management }: { management: MenuManagement }) {
  const { t } = useAppTranslation()
  const { form, mode, saving } = management
  const kind = useWatch({ control: form.control, name: "kind" })
  const excluded = new Set<string>()
  if (mode === "edit" && management.selected) {
    excluded.add(management.selected.id)
    let changed = true
    while (changed) {
      changed = false
      for (const menu of management.menus) {
        if (!excluded.has(menu.id) && menu.parentId && excluded.has(menu.parentId)) {
          excluded.add(menu.id)
          changed = true
        }
      }
    }
  }
  if (!mode) return null

  return (
    <Dialog
      open
      title={t(mode === "create" ? "navigation:management.create" : "navigation:management.edit")}
      onOpenChange={(open) => { if (!open && !saving) management.cancel() }}
    >
      <DefaultForm onSubmit={management.submit}>
        <Field required={mode === "create"} readOnly={mode === "edit"}
          description={mode === "edit" ? t("common:labels.immutableAfterCreate") : undefined}
          label={t("navigation:management.fields.id")} htmlFor="menu-editor-id" error={t(form.formState.errors.id?.message)}>
          <Input id="menu-editor-id" {...form.register("id")} readOnly={mode === "edit"} aria-describedby={mode === "edit" ? "menu-editor-id-description" : undefined} aria-invalid={!!form.formState.errors.id} />
        </Field>
        <Field required label={t("navigation:management.fields.name")} htmlFor="menu-editor-name" error={t(form.formState.errors.label?.message)}>
          <Input id="menu-editor-name" {...form.register("label")} aria-invalid={!!form.formState.errors.label} />
        </Field>
        <Field label={t("navigation:management.fields.kind")} htmlFor="menu-editor-kind">
          <Controller control={form.control} name="kind" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="menu-editor-kind" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="group">{t("navigation:management.kinds.group")}</SelectItem>
                <SelectItem value="page">{t("navigation:management.kinds.page")}</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label={t("navigation:management.fields.parent")} htmlFor="menu-editor-parent">
          <Controller control={form.control} name="parentId" render={({ field }) => (
            <Select value={field.value ?? "__root__"} onValueChange={(value) => field.onChange(value === "__root__" ? null : value)}>
              <SelectTrigger id="menu-editor-parent" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__root__">{t("navigation:management.root")}</SelectItem>
                {management.menus.filter(menu => menu.kind === "group" && !excluded.has(menu.id)).sort(sortByOrder).map(menu => (
                  <SelectItem key={menu.id} value={menu.id}>{getMenuLabel(menu, t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </Field>
        {kind === "page" ? (
          <>
            <Field required label={t("navigation:management.fields.path")} htmlFor="menu-editor-path" error={t(form.formState.errors.path?.message)}>
              <Input id="menu-editor-path" placeholder="/app/example" {...form.register("path")} aria-invalid={!!form.formState.errors.path} />
            </Field>
            <Field label={t("navigation:management.fields.icon")} htmlFor="menu-editor-icon">
              <Controller control={form.control} name="icon" render={({ field }) => (
                <Select value={field.value ?? "none"} onValueChange={value => field.onChange(value === "none" ? undefined : value)}>
                  <SelectTrigger id="menu-editor-icon" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("navigation:management.noIcon")}</SelectItem>
                    {ICON_OPTIONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </Field>
          </>
        ) : null}
        <Field required label={t("navigation:management.fields.sortOrder")} htmlFor="menu-editor-order" error={t(form.formState.errors.sortOrder?.message)}>
          <Input id="menu-editor-order" type="number" min={0} step={1} {...form.register("sortOrder", { valueAsNumber: true })} aria-invalid={!!form.formState.errors.sortOrder} />
        </Field>
        <Field label={t("navigation:management.fields.scope")} htmlFor="menu-editor-scope">
          <Controller control={form.control} name="scope" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="menu-editor-scope" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">{t("navigation:management.scopes.SYSTEM")}</SelectItem>
                <SelectItem value="GENERAL">{t("navigation:management.scopes.GENERAL")}</SelectItem>
              </SelectContent>
            </Select>
          )} />
        </Field>
        <Field label={t("navigation:management.fields.enabled")} htmlFor="menu-editor-enabled" orientation="horizontal">
          <Controller control={form.control} name="enabled" render={({ field }) => (
            <Switch id="menu-editor-enabled" checked={field.value} onCheckedChange={field.onChange} />
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

export function MenuManagementPanel({ management }: { management: MenuManagement }) {
  return (
    <>
      <section className="grid min-w-0 grid-cols-1 items-start gap-content xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <MenuList management={management} />
        <MenuDetails management={management} />
      </section>
      <MenuFormDialog management={management} />
    </>
  )
}
