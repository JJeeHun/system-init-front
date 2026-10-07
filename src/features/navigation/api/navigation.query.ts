import { queryOptions } from "@tanstack/react-query"

import { getNavigationBootstrap } from "@/features/navigation/api/navigation.api"

export const navigationQueryKeys = {
  all: ["navigation"] as const,
  bootstrap: () => [...navigationQueryKeys.all, "bootstrap"] as const,
}

export const navigationQueries = {
  bootstrap: () =>
    queryOptions({
      queryKey: navigationQueryKeys.bootstrap(),
      queryFn: getNavigationBootstrap,
    }),
}
