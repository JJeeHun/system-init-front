const AUTH_SESSION_KEY = "system-init-front.auth"

export type AuthSession = {
  accessToken: string
  expiresAt: number
}

export function getAuthSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY)

  if (!storedSession) {
    return null
  }

  try {
    const session = JSON.parse(storedSession) as AuthSession

    if (session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(AUTH_SESSION_KEY)
      return null
    }

    return session
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function setAuthSession(accessToken: string, expiresIn: number) {
  const session: AuthSession = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}
