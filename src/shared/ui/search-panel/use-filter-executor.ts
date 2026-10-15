import { useCallback, useEffect, useRef, useState } from "react"

export type SearchType = "api" | "filter"
export type SearchStatus = "idle" | "loading" | "success" | "error"

type FilterResult<TItem, TCriteria> = {
  source: readonly TItem[]
  criteria: TCriteria
  data: TItem[]
}

const MIN_LOADING_MS = 300
const SUCCESS_FEEDBACK_MS = 800

export function useFilterExecutor<TItem, TCriteria>(
  items: readonly TItem[],
  filter: (items: readonly TItem[], criteria: TCriteria) => TItem[],
  { minLoadingMs = MIN_LOADING_MS, successFeedbackMs = SUCCESS_FEEDBACK_MS } = {},
) {
  const [status, setStatus] = useState<SearchStatus>("idle")
  const [result, setResult] = useState<FilterResult<TItem, TCriteria> | null>(null)
  const [request, setRequest] = useState<{ criteria: TCriteria } | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!request) return

    let cancelled = false
    let completionTimer: ReturnType<typeof setTimeout> | undefined
    const startedAt = performance.now()
    runningRef.current = true
    setStatus("loading")

    // Defer synchronous work to a new task, then settle it through a Promise.
    const workTimer = setTimeout(() => {
      void Promise.resolve()
        .then(() => filter(items, request.criteria))
        .then(data => {
          if (cancelled) return
          setResult({ source: items, criteria: request.criteria, data })
          const remaining = Math.max(0, minLoadingMs - (performance.now() - startedAt))
          completionTimer = setTimeout(() => {
            if (!cancelled) setStatus("success")
          }, remaining)
        })
        .catch(() => {
          if (!cancelled) {
            runningRef.current = false
            setStatus("error")
          }
        })
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(workTimer)
      clearTimeout(completionTimer)
    }
  }, [request, items, filter, minLoadingMs])

  useEffect(() => {
    if (status !== "success") return
    const timer = setTimeout(() => {
      runningRef.current = false
      setStatus("idle")
    }, successFeedbackMs)
    return () => clearTimeout(timer)
  }, [status, successFeedbackMs])

  const execute = useCallback((criteria: TCriteria) => {
    if (runningRef.current) return
    runningRef.current = true

    if (result?.source === items && Object.is(result.criteria, criteria)) {
      setStatus("success")
      return
    }
    setStatus("loading")
    setRequest({ criteria })
  }, [items, result])

  const reset = useCallback(() => {
    runningRef.current = false
    setRequest(null)
    setResult(null)
    setStatus("idle")
  }, [])

  return {
    type: "filter" as const,
    status,
    data: result && result.source === items ? result.data : items,
    execute,
    reset,
  }
}
