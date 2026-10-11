import { useId, useState, type FormEventHandler, type ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

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
  const [expanded, setExpanded] = useState(true)
  const contentId = useId()
  return (
    <Panel>
      <Panel.Header
        title={t("common:searchPanel.title")}
        actions={
          <Button size="sm" onClick={() => setExpanded(value => !value)}
            aria-expanded={expanded} aria-controls={contentId}>
            {expanded ? <ChevronUpIcon aria-hidden="true" className="size-4" /> : <ChevronDownIcon aria-hidden="true" className="size-4" />}
            {t(expanded ? "common:searchPanel.collapse" : "common:searchPanel.expand")}
          </Button>
        }
      />
      <div id={contentId} hidden={!expanded}>
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
      </div>
    </Panel>
  )
}
