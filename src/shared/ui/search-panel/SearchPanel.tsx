import { useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent, type FormEventHandler, type ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { Panel } from "@/shared/ui/panel"
import { usePageActionPermission } from "@/shared/ui/page-permissions"

import { useAppTranslation } from "@/shared/i18n"
import { FilterBar } from "@/shared/layout/filter-bar"

import { Skeleton } from "@/shared/components/ui/skeleton"

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
  const panelRef = useRef<HTMLDivElement>(null)
  const focusedElement = useRef<HTMLElement | null>(null)
  const restorePending = useRef(false)
  useEffect(() => () => {
    requestId.current += 1
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current)
  }, [])
  const searchStatus = feedback === "idle"
    ? status ?? (!hasSubmitted.current && loading ? "loading" : "idle")
    : feedback
  const busy = searchStatus === "loading" || searchStatus === "success"
  const permitted = usePageActionPermission("view") && !disabled
  const canSearch = permitted && !busy && !loading
  const canReset = permitted && !loading && (feedback !== "idle" || !busy)
  const searchLabel = feedback === "idle" && searchType === "api" && status === undefined
    ? t("common:actions.search")
    : searchStatus === "loading"
    ? t(searchType === "filter" ? "common:searchPanel.filterLoading" : "common:searchPanel.apiLoading")
    : searchStatus === "success" ? t("common:searchPanel.completed")
      : searchStatus === "error" ? t("common:searchPanel.failed") : t("common:actions.search")
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const clearFocus = (event: Event) => {
      if (event.target instanceof Node && !panel.contains(event.target)) {
        focusedElement.current = null
        restorePending.current = false
      }
    }
    const clearOnWindowBlur = () => {
      focusedElement.current = null
      restorePending.current = false
    }
    document.addEventListener("focusin", clearFocus)
    document.addEventListener("pointerdown", clearFocus, true)
    window.addEventListener("blur", clearOnWindowBlur)
    return () => {
      document.removeEventListener("focusin", clearFocus)
      document.removeEventListener("pointerdown", clearFocus, true)
      window.removeEventListener("blur", clearOnWindowBlur)
      focusedElement.current = null
      restorePending.current = false
    }
  }, [])

  useLayoutEffect(() => {
    const panel = panelRef.current
    const active = document.activeElement
    if (active instanceof HTMLElement && panel?.contains(active)) {
      focusedElement.current = active
    }
    const target = focusedElement.current
    if (!target) return
    if (!panel?.contains(target) || target.closest("[hidden]")) {
      focusedElement.current = null
      restorePending.current = false
      return
    }
    if (active !== target && active !== document.body && active !== null) {
      focusedElement.current = null
      restorePending.current = false
      return
    }
    if (loading || target.matches(":disabled") || target.closest("[inert]")) {
      restorePending.current = true
      return
    }
    if (!restorePending.current) return
    restorePending.current = false
    if (active !== target && target.checkVisibility?.() !== false) {
      target.focus({ preventScroll: true })
    }
  }, [loading, canSearch, canReset, expanded])

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.currentTarget.contains(event.target)) {
      focusedElement.current = event.target
      restorePending.current = false
    }
  }
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return
    if (event.target.matches(":disabled") || event.target.closest("[inert]")) return
    focusedElement.current = null
    restorePending.current = false
  }
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
    <div ref={panelRef} className="min-w-0" aria-busy={loading} onFocusCapture={handleFocus} onBlurCapture={handleBlur}>
      <Panel>
        <Panel.Header
          title={t("common:searchPanel.title")}
          actions={
            <Button size="sm" disabled={loading} onClick={() => setExpanded(value => !value)}
              aria-label={t(expanded ? "common:searchPanel.collapse" : "common:searchPanel.expand")}
              title={t(expanded ? "common:searchPanel.collapse" : "common:searchPanel.expand")}
              aria-expanded={expanded} aria-controls={contentId}>
              {expanded ? <ChevronUpIcon aria-hidden="true" className="size-4" /> : <ChevronDownIcon aria-hidden="true" className="size-4" />}
            </Button>
          }
        />
        <div id={contentId} hidden={!expanded}>
          <Panel.Content>
            <Form onSubmit={handleSearch} className="grid min-w-0 gap-3">
              <div className="relative min-w-0">
                <div inert={loading} className={loading ? "opacity-0" : undefined}>
                  <FilterBar>{children}</FilterBar>
                </div>
                {loading ? <Skeleton aria-hidden="true" className="absolute inset-0" /> : null}
              </div>
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
      {loading ? (
        <span role="status" aria-live="polite" className="sr-only">
          {t(searchType === "filter" ? "common:searchPanel.filterLoading" : "common:searchPanel.apiLoading")}
        </span>
      ) : null}
    </div>
  )
}
