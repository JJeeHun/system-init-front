import { useCallback, useState } from "react"

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const on = useCallback(() => setValue(true), [])
  const off = useCallback(() => setValue(false), [])
  const toggle = useCallback(() => setValue((current) => !current), [])
  const set = useCallback((nextValue: boolean) => setValue(nextValue), [])

  return {
    value,
    on,
    off,
    toggle,
    set,
  }
}
