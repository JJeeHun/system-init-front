export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production"

export type AppConfig = Readonly<{
  app: Readonly<{
    name: string
    environment: AppEnvironment
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

export const config: AppConfig = Object.freeze({
  app: Object.freeze({
    name: "system-init-front",
    environment: resolveEnvironment(import.meta.env.MODE),
    baseUrl: import.meta.env.BASE_URL,
  }),
})
