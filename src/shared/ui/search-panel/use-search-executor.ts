import { useCallback, useState } from "react"
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"

type SearchExecutorOptions<TData, TCriteria> = {
  queryKey: QueryKey
  queryFn: (criteria: TCriteria) => TData | Promise<TData>
  /** @deprecated Search feedback timing is managed by SearchPanel. */
  minLoadingMs?: number
}

export function useSearchExecutor<TData, TCriteria>({
  queryKey,
  queryFn,
}: SearchExecutorOptions<TData, TCriteria>) {
  const queryClient = useQueryClient()
  const [request, setRequest] = useState<{ criteria: TCriteria } | null>(null)

  const getKey = (criteria: TCriteria): QueryKey => ["filter", ...queryKey, { criteria }]
  const run = (criteria: TCriteria) => () => queryFn(criteria)

  const query = useQuery({
    queryKey: request ? getKey(request.criteria) : ["filter", ...queryKey, { active: false }],
    queryFn: () => run(request!.criteria)(),
    enabled: request !== null,
    staleTime: Infinity,
    retry: false,
    placeholderData: previousData => previousData,
  })

  const execute = useCallback((criteria: TCriteria) => {
    setRequest({ criteria })
    return queryClient.ensureQueryData({
      queryKey: getKey(criteria),
      queryFn: run(criteria),
      staleTime: Infinity,
    })
  }, [queryClient, queryKey, queryFn])

  const reset = useCallback(() => setRequest(null), [])

  return {
    ...query,
    data: request ? query.data : undefined,
    type: "filter" as const,
    execute,
    reset,
  }
}
