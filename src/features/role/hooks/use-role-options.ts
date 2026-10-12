import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { roleQueries } from "@/features/role/api/role-management.api"

export function useRoleOptions() {
  const query = useQuery(roleQueries.assignable())
  const options = useMemo(
    () => (query.data ?? []).map(role => ({ value: role.id, label: role.name })),
    [query.data],
  )

  return { options, isLoading: query.isLoading, isError: query.isError }
}
