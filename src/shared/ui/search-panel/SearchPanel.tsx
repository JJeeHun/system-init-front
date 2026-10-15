import { useId, useState, type FormEventHandler, type ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { useAppTranslation } from "@/shared/i18n"
import { FilterBar } from "@/shared/layout/filter-bar"
import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { Panel } from "@/shared/ui/panel"
import { usePageActionPermission } from "@/shared/ui/page-permissions"
import type { SearchStatus, SearchType } from "@/shared/ui/search-panel/use-filter-executor"

export type SearchPanelProps = {
  children: ReactNode
  onSearch: FormEventHandler<HTMLFormElement>
  onReset: () => void
  loading?: boolean
  disabled?: boolean
  searchType?: SearchType
  status?: SearchStatus
}

export function SearchPanel({ children, onSearch, onReset, loading = false, disabled = false, searchType = "api", status }: SearchPanelProps) {
  const { t } = useAppTranslation()
  const [expanded, setExpanded] = useState(true)
  const contentId = useId()
  const searchStatus = status ?? (loading ? "loading" : "idle")
  const busy = searchStatus === "loading" || searchStatus === "success"
  const canSearch = usePageActionPermission("view") && !busy && !disabled
  const searchLabel = status === undefined ? t("common:actions.search") : searchStatus === "loading"
    ? t(searchType === "filter" ? "common:searchPanel.filterLoading" : "common:searchPanel.apiLoading")
    : searchStatus === "success" ? t("common:searchPanel.completed")
      : searchStatus === "error" ? t("common:searchPanel.failed") : t("common:actions.search")
  const handleSearch: FormEventHandler<HTMLFormElement> = event => {
    if (!canSearch) {
      event.preventDefault()
      return
    }
    onSearch(event)
  }
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
          <Form onSubmit={handleSearch} className="grid min-w-0 gap-3">
          <FilterBar>{children}</FilterBar>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" disabled={!canSearch} onClick={() => { if (canSearch) onReset() }}>
              {t("common:actions.reset")}
            </Button>
            <Button type="submit" primary size="sm" loading={searchStatus === "loading"} disabled={!canSearch}>
              <span aria-live="polite">{searchLabel}</span>
            </Button>
          </div>
          </Form>
        </Panel.Content>
      </div>
    </Panel>
  )
}
