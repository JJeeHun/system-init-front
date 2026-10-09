export type DialogOptions = {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export type DialogRequest = {
  kind: "alert" | "confirm"
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  destructive: boolean
}

let active: DialogRequest | null = null
let resolveActive: ((confirmed: boolean) => void) | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

function request(kind: DialogRequest["kind"], options: string | DialogOptions): Promise<boolean> {
  // The lock is acquired synchronously, before React updates the dialog UI.
  if (active) return Promise.resolve(false)

  const normalized: DialogOptions = typeof options === "string" ? { description: options } : options

  return new Promise<boolean>((resolve) => {
    active = {
      kind,
      title: normalized.title ?? (kind === "alert" ? "알림" : "확인"),
      description: normalized.description,
      confirmLabel: normalized.confirmLabel ?? "확인",
      cancelLabel: normalized.cancelLabel ?? "취소",
      destructive: normalized.destructive ?? false,
    }
    resolveActive = resolve
    notify()
  })
}

export const dialog = {
  alert: async (options: string | DialogOptions): Promise<void> => {
    await request("alert", options)
  },
  confirm: (options: string | DialogOptions): Promise<boolean> =>
    request("confirm", options),
}

export const dialogStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  getSnapshot: () => active,
  complete: (confirmed: boolean) => {
    if (!active) return
    const resolve = resolveActive
    active = null
    resolveActive = null
    notify()
    resolve?.(confirmed)
  },
}
