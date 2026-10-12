import { AppError } from "@/shared/lib/app-error"
import { clearAuthSession } from "@/features/auth/storage/auth-session"

const forbiddenListeners = new Set<() => void>()
let forbiddenGeneration = 0

export function subscribeForbiddenNavigation(listener: () => void) {
  forbiddenListeners.add(listener)
  return () => { forbiddenListeners.delete(listener) }
}

export function getForbiddenGeneration() {
  return forbiddenGeneration
}

export function handleAuthResponseError(error: unknown): boolean {
  if (!(error instanceof AppError)) return false

  if (error.code === "AUTH_UNAUTHORIZED") {
    clearAuthSession("unauthorized")
    return true
  }
  if (error.code === "AUTH_FORBIDDEN") {
    forbiddenGeneration += 1
    forbiddenListeners.forEach(listener => listener())
    return true
  }
  return false
}
