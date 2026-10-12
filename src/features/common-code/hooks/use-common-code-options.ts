import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { commonCodeQueries } from "@/features/common-code/api/common-code.api"
import type { CommonCodeGroupCode } from "@/features/common-code/constants/common-code-group"

export function useCommonCodeOptions(groupCode: CommonCodeGroupCode) {
  const groupsQuery = useQuery(commonCodeQueries.groups())
  const group = groupsQuery.data?.find(
    (item) => item.code === groupCode && item.enabled,
  )
  const itemsQuery = useQuery(commonCodeQueries.items(group?.id ?? null))

  const options = useMemo(
    () =>
      (itemsQuery.data ?? [])
        .filter((item) => item.enabled)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
        .map((item) => ({ value: item.code, label: item.name })),
    [itemsQuery.data],
  )

  return {
    options,
    isLoading: groupsQuery.isLoading || (!!group && itemsQuery.isLoading),
    isError: groupsQuery.isError || itemsQuery.isError,
    isGroupUnavailable: groupsQuery.isSuccess && !group,
  }
}
