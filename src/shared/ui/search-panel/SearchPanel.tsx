import type { FormEventHandler, ReactNode } from "react"

import { useAppTranslation } from "@/shared/i18n"
import { FilterBar } from "@/shared/layout/filter-bar"
import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { Panel } from "@/shared/ui/panel"

export type SearchPanelProps = {
  children: ReactNode
  onSearch: FormEventHandler<HTMLFormElement>
  onReset: () => void
  loading?: boolean
  disabled?: boolean
}

export function SearchPanel({ children, onSearch, onReset, loading = false, disabled = false }: SearchPanelProps) {
  const { t } = useAppTranslation()
  return (
    <Panel>
      <Panel.Header title={t("common:searchPanel.title")} />
      <Panel.Content>
        <Form onSubmit={onSearch} className="grid min-w-0 gap-3">
          <FilterBar>{children}</FilterBar>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" disabled={loading || disabled} onClick={onReset}>
              {t("common:actions.reset")}
            </Button>
            <Button type="submit" primary size="sm" loading={loading} disabled={disabled}>
              {t("common:actions.search")}
            </Button>
          </div>
        </Form>
      </Panel.Content>
    </Panel>
  )
}
