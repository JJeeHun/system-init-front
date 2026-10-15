import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  const runningRef = useRef(false)
  const itemsRef = useRef(items)
  const filterRef = useRef(filter)
  const framesRef = useRef<number[]>([])
  const timersRef = useRef<number[]>([])
  itemsRef.current = items
  filterRef.current = filter

  const cancelScheduled = useCallback(() => {
    for (const frame of framesRef.current) window.cancelAnimationFrame(frame)
    for (const timer of timersRef.current) window.clearTimeout(timer)
    framesRef.current = []
    timersRef.current = []
  }, [])

  useEffect(() => cancelScheduled, [cancelScheduled])

  const data = useMemo(() => {
    if (!result) return items
    return result.source === items ? result.data : filter(items, result.criteria)
  }, [items, filter, result])

  const execute = useCallback((criteria: TCriteria) => {
    if (runningRef.current) return
    cancelScheduled()
    runningRef.current = true
    setStatus("loading")
    const startedAt = performance.now()

    // Give React and the browser an opportunity to paint Loading before synchronous filtering.
    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        try {
          const source = itemsRef.current
          const filtered = filterRef.current(source, criteria)
          setResult({ source, criteria, data: filtered })
          const remaining = Math.max(0, minLoadingMs - (performance.now() - startedAt))
          timersRef.current.push(window.setTimeout(() => {
            setStatus("success")
            timersRef.current.push(window.setTimeout(() => {
              runningRef.current = false
              setStatus("idle")
            }, successFeedbackMs))
          }, remaining))
        } catch {
          runningRef.current = false
          setStatus("error")
        }
      })
      framesRef.current.push(secondFrame)
    })
    framesRef.current.push(firstFrame)
  }, [cancelScheduled, minLoadingMs, successFeedbackMs])

  const reset = useCallback(() => {
    cancelScheduled()
    runningRef.current = false
    setResult(null)
    setStatus("idle")
  }, [cancelScheduled])

  return { type: "filter" as const, status, data, execute, reset }
}
