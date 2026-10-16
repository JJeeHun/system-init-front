import { useCallback, useState } from "react"
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"

const MIN_LOADING_MS = 300

type SearchExecutorOptions<TData, TCriteria> = {
  queryKey: QueryKey
  queryFn: (criteria: TCriteria) => TData | Promise<TData>
  minLoadingMs?: number
}

export function useSearchExecutor<TData, TCriteria>({
  queryKey,
  queryFn,
  minLoadingMs = MIN_LOADING_MS,
}: SearchExecutorOptions<TData, TCriteria>) {
  const queryClient = useQueryClient()
  const [request, setRequest] = useState<{ criteria: TCriteria } | null>(null)

  const getKey = (criteria: TCriteria): QueryKey => ["filter", ...queryKey, { criteria }]
  const run = (criteria: TCriteria) => async () => {
    const [data] = await Promise.all([
      Promise.resolve().then(() => queryFn(criteria)),
      new Promise<void>(resolve => setTimeout(resolve, minLoadingMs)),
    ])
    return data
  }

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
  }, [queryClient, queryKey, queryFn, minLoadingMs])

  const reset = useCallback(() => setRequest(null), [])

  return {
    ...query,
    data: request ? query.data : undefined,
    type: "filter" as const,
    execute,
    reset,
  }
}
