import { useEffect, useId, useRef, useState, type FormEventHandler, type ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { useAppTranslation } from "@/shared/i18n"
import { FilterBar } from "@/shared/layout/filter-bar"
import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { Panel } from "@/shared/ui/panel"
import { usePageActionPermission } from "@/shared/ui/page-permissions"

const COMPLETION_FEEDBACK_MS = 800

export type SearchType = "api" | "filter"
export type SearchStatus = "idle" | "loading" | "success" | "error"

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
  const [feedback, setFeedback] = useState<SearchStatus>("idle")
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestId = useRef(0)
  const submitting = useRef(false)
  const hasSubmitted = useRef(false)
  const contentId = useId()
  useEffect(() => () => {
    requestId.current += 1
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current)
  }, [])
  const searchStatus = feedback === "idle"
    ? status ?? (!hasSubmitted.current && loading ? "loading" : "idle")
    : feedback
  const busy = searchStatus === "loading" || searchStatus === "success"
  const permitted = usePageActionPermission("view") && !disabled
  const canSearch = permitted && !busy
  const canReset = permitted && (feedback === "idle" ? !busy : !loading)
  const searchLabel = feedback === "idle" && searchType === "api" && status === undefined
    ? t("common:actions.search")
    : searchStatus === "loading"
    ? t(searchType === "filter" ? "common:searchPanel.filterLoading" : "common:searchPanel.apiLoading")
    : searchStatus === "success" ? t("common:searchPanel.completed")
      : searchStatus === "error" ? t("common:searchPanel.failed") : t("common:actions.search")
  const handleSearch: FormEventHandler<HTMLFormElement> = event => {
    if (!canSearch || submitting.current) {
      event.preventDefault()
      return
    }

    submitting.current = true
    hasSubmitted.current = true
    const id = ++requestId.current
    setFeedback("loading")
    try {
      void Promise.resolve(onSearch(event)).then(() => {
        if (requestId.current !== id) return
        setFeedback("success")
        feedbackTimer.current = setTimeout(() => {
          if (requestId.current !== id) return
          submitting.current = false
          setFeedback("idle")
        }, COMPLETION_FEEDBACK_MS)
      }).catch(() => {
        if (requestId.current !== id) return
        submitting.current = false
        setFeedback("error")
      })
    } catch {
      submitting.current = false
      setFeedback("error")
    }
  }
  const handleReset = () => {
    if (!canReset) return
    onReset()
    requestId.current += 1
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current)
    submitting.current = false
    hasSubmitted.current = false
    setFeedback("idle")
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
            <Button size="sm" disabled={!canReset} onClick={handleReset}>
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
