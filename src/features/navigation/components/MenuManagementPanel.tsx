import { Controller, useWatch } from "react-hook-form"
import { useAppTranslation } from "@/shared/i18n"

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
import { Dialog } from "@/shared/ui/dialog"
import { Field } from "@/shared/ui/field"
import { Panel } from "@/shared/ui/panel"
import { DefaultForm } from "@/shared/layout/default-form"
import { Skeleton } from "@/shared/components/ui/skeleton"

type MenuManagement = ReturnType<typeof useMenuManagement>
const ICON_OPTIONS: NavigationIconKey[] = ["activity", "boxes", "calendar", "clipboard", "code", "dashboard", "package", "receipt", "scan", "settings", "truck", "users"]

function sortByOrder(a: MenuRecord, b: MenuRecord) {
  return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)
}

function MenuTree({ menus, parentId, depth, selectedId, onSelect }: {
  menus: MenuRecord[]
  parentId: string | null
  depth: number
  selectedId: string | null
  onSelect: (menu: MenuRecord) => void
}) {
  const { t } = useAppTranslation()
  return (
    <>
      {menus.filter((menu) => menu.parentId === parentId).sort(sortByOrder).map((menu) => (
        <div key={menu.id} className="grid gap-1">
          <Button
            size="sm"
            primary={menu.id === selectedId}
            aria-pressed={menu.id === selectedId}
            onClick={() => onSelect(menu)}
            title={menu.path || getMenuLabel(menu, t)}
          >
            <span className={["flex min-w-0 w-full items-center gap-2 text-left", ["", "pl-3", "pl-6", "pl-9", "pl-12"][Math.min(depth, 4)]].join(" ")}>
              <MenuIcon name={menu.icon} />
              <span className="min-w-0 flex-1 truncate">{getMenuLabel(menu, t)}</span>
              {!menu.enabled ? <span className="shrink-0 text-xs opacity-70">{t("common:labels.disabled")}</span> : null}
            </span>
          </Button>
          {menu.kind === "group" ? (
            <MenuTree menus={menus} parentId={menu.id} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ) : null}
        </div>
      ))}
    </>
  )
}

function MenuList({ management }: { management: MenuManagement }) {
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header
        title={t("navigation:management.treeTitle")}
        description={t("navigation:management.treeDescription")}
        actions={<Button primary size="sm" onClick={() => management.startCreate()}>{t("navigation:management.addRoot")}</Button>}
      />
      <Panel.Content>
        {management.loadError ? <p role="alert" className="text-sm text-destructive">{management.loadError}</p> : null}
        {management.isLoading ? (
          <div role="status" aria-label={t("navigation:management.loading")} className="grid gap-2">
            {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}
          </div>
        ) : management.menus.length === 0 ? (
          <p className="text-sm text-foreground-soft">{t("navigation:management.empty")}</p>
        ) : (
          <ScrollArea type="always" className="h-80 min-w-0 sm:h-[var(--layout-grid-height)]">
            <div className="grid min-w-0 gap-1 pr-2 [&>div>button]:w-full">
              <MenuTree menus={management.menus} parentId={null} depth={0} selectedId={management.selected?.id ?? null} onSelect={management.selectMenu} />
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
        description={selected ? getMenuLabel(selected, t) : t("navigation:management.choose")}
        actions={selected ? (
          <>
            <Button size="sm" disabled={selected.kind !== "group" || management.saving} onClick={() => management.startCreate(selected.id)}>{t("navigation:management.addChild")}</Button>
            <Button size="sm" disabled={management.saving || management.deleting} onClick={management.startEdit}>{t("common:actions.edit")}</Button>
            <Button error size="sm" disabled={management.saving || management.deleting} loading={management.deleting} onClick={() => void management.deleteSelected()}>{t("common:actions.delete")}</Button>
          </>
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
              [t("navigation:management.fields.permissionCode"), selected.permissionCode || "—"],
            ] as const).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="mb-1 text-xs text-foreground-soft">{label}</dt>
                <dd className="break-all font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-5 text-xs text-foreground-soft">{t("navigation:management.permissionNotice")}</p>
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
        <Field required label={t("navigation:management.fields.id")} htmlFor="menu-editor-id" error={form.formState.errors.id?.message}>
          <Input id="menu-editor-id" {...form.register("id", {
            required: t("navigation:management.validation.idRequired"),
            pattern: { value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: t("navigation:management.validation.idFormat") },
          })} readOnly={mode === "edit"} aria-invalid={!!form.formState.errors.id} />
        </Field>
        <Field required label={t("navigation:management.fields.name")} htmlFor="menu-editor-name" error={form.formState.errors.label?.message}>
          <Input id="menu-editor-name" {...form.register("label", { required: t("navigation:management.validation.nameRequired") })} aria-invalid={!!form.formState.errors.label} />
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
            <Field required label={t("navigation:management.fields.path")} htmlFor="menu-editor-path" error={form.formState.errors.path?.message}>
              <Input id="menu-editor-path" placeholder="/app/example" {...form.register("path", {
                required: t("navigation:management.validation.pathRequired"),
                pattern: { value: /^\/app\/[^?#]+$/, message: t("navigation:management.validation.pathFormat") },
              })} aria-invalid={!!form.formState.errors.path} />
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
        <Field required label={t("navigation:management.fields.sortOrder")} htmlFor="menu-editor-order" error={form.formState.errors.sortOrder?.message}>
          <Input id="menu-editor-order" type="number" min={0} step={1} {...form.register("sortOrder", {
            valueAsNumber: true,
            required: t("navigation:management.validation.orderRequired"),
            min: { value: 0, message: t("navigation:management.validation.orderInvalid") },
            validate: value => Number.isInteger(value) || t("navigation:management.validation.orderInvalid"),
          })} aria-invalid={!!form.formState.errors.sortOrder} />
        </Field>
        <Field label={t("navigation:management.fields.permissionCode")} htmlFor="menu-editor-permission" description={t("navigation:management.permissionNotice")}>
          <Input id="menu-editor-permission" {...form.register("permissionCode")} />
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
