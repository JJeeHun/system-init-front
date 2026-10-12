const AUTH_SESSION_KEY = "system-init-front.auth"

export type AuthSession = {
  accessToken: string
  expiresAt: number
}

export type SessionEndReason = "expired" | "unauthorized" | null

const listeners = new Set<() => void>()
let expiryTimer: ReturnType<typeof setTimeout> | null = null
let scheduledExpiresAt: number | null = null
let endReason: SessionEndReason = null

function notify() {
  listeners.forEach(listener => listener())
}

function cancelExpiryTimer() {
  if (expiryTimer !== null) clearTimeout(expiryTimer)
  expiryTimer = null
  scheduledExpiresAt = null
}

function scheduleExpiry(expiresAt: number) {
  if (scheduledExpiresAt === expiresAt) return
  cancelExpiryTimer()
  scheduledExpiresAt = expiresAt
  expiryTimer = setTimeout(() => {
    expiryTimer = null
    scheduledExpiresAt = null
    if (getAuthSession() === null) notify()
  }, Math.min(expiresAt - Date.now(), 2_147_483_647))
}

export function getAuthSession(): AuthSession | null {
  const stored = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!stored) {
    cancelExpiryTimer()
    return null
  }

  try {
    const session: unknown = JSON.parse(stored)
    if (!session || typeof session !== "object" ||
      !("accessToken" in session) || typeof session.accessToken !== "string" ||
      !session.accessToken || !("expiresAt" in session) ||
      typeof session.expiresAt !== "number" || !Number.isFinite(session.expiresAt)) {
      throw new Error("Invalid auth session")
    }
    if (session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(AUTH_SESSION_KEY)
      cancelExpiryTimer()
      endReason = "expired"
      return null
    }
    scheduleExpiry(session.expiresAt)
    return { accessToken: session.accessToken, expiresAt: session.expiresAt }
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    cancelExpiryTimer()
    return null
  }
}

export function getAuthSessionToken(): string | null {
  return getAuthSession()?.accessToken ?? null
}

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function getSessionEndReason(): SessionEndReason {
  return endReason
}

export function setAuthSession(accessToken: string, expiresIn: number) {
  const session: AuthSession = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  endReason = null
  scheduleExpiry(session.expiresAt)
  notify()
}

export function clearAuthSession(reason: SessionEndReason = null) {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  cancelExpiryTimer()
  endReason = reason
  notify()
}
