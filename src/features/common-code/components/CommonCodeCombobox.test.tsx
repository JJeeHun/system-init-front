// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, renderHook, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { commonCodeQueryKeys } from "@/features/common-code/api/common-code.api"
import { CommonCodeCombobox } from "@/features/common-code/components/CommonCodeCombobox"
import { CommonCodeGroupCode } from "@/features/common-code/constants/common-code-group"
import { useCommonCodeOptions } from "@/features/common-code/hooks/use-common-code-options"

function createClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(commonCodeQueryKeys.groups, [
    { id: "group-1", code: "USE_YN", name: "사용 여부", description: "", enabled: true, sortOrder: 1 },
    { id: "group-2", code: "INBOUND_STATUS", name: "입고 상태", description: "", enabled: true, sortOrder: 2 },
  ])
  client.setQueryData(commonCodeQueryKeys.items("group-1"), [
    { id: "1", groupId: "group-1", code: "N", name: "미사용", description: "", enabled: true, sortOrder: 20 },
    { id: "2", groupId: "group-1", code: "Y", name: "사용", description: "", enabled: true, sortOrder: 10 },
    { id: "3", groupId: "group-1", code: "H", name: "숨김", description: "", enabled: false, sortOrder: 30 },
  ])
  return client
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe("CommonCodeCombobox", () => {
  it("loads the specified master key and exposes enabled detail codes in order", () => {
    const client = createClient()
    const { result } = renderHook(
      () => useCommonCodeOptions(CommonCodeGroupCode.YES_NO),
      { wrapper: createWrapper(client) },
    )

    expect(result.current.options).toEqual([
      { value: "Y", label: "사용" },
      { value: "N", label: "미사용" },
    ])
    expect(result.current.isLoading).toBe(false)
    client.clear()
  })

  it("shows the selected code label from its master group", () => {
    const client = createClient()
    render(
      <QueryClientProvider client={client}>
        <CommonCodeCombobox groupCode={CommonCodeGroupCode.YES_NO} value="Y" aria-label="사용 여부 선택" />
      </QueryClientProvider>,
    )

    expect(screen.getByRole("combobox", { name: "사용 여부 선택" })).toHaveValue("사용")
    client.clear()
  })
})
