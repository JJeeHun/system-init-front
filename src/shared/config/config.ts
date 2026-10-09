export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production"

export type AppConfig = Readonly<{
  app: Readonly<{
    name: string
    environment: AppEnvironment
    isProduction: boolean
    baseUrl: string
  }>
}>

function resolveEnvironment(mode: string): AppEnvironment {
  if (mode === "production") {
    return "production"
  }

  if (mode === "test") {
    return "test"
  }

  if (mode === "stage" || mode === "staging") {
    return "staging"
  }

  return "development"
}

const environment = resolveEnvironment(import.meta.env.MODE)

export const config: AppConfig = Object.freeze({
  app: Object.freeze({
    name: "system-init-front",
    environment,
    isProduction: environment === "production",
    baseUrl: import.meta.env.BASE_URL,
  }),
})
