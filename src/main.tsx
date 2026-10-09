import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@/shared/i18n"
import App from "@/app/App"
import { Toaster } from "@/shared/components/ui/sonner"
import { GlobalDialogHost } from "@/shared/ui/confirm-dialog/GlobalDialogHost"
import { notifyGlobalError } from "@/shared/lib/message-error"
import "@/index.css"

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.globalError === true) {
        notifyGlobalError(error)
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
      <Toaster position="top-right" closeButton visibleToasts={3} />
      <GlobalDialogHost />
    </QueryClientProvider>
  </StrictMode>,
)
