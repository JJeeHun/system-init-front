// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DataGrid } from "@/shared/ui/data-grid"

type Row = { id: string; name: string }
const columns: { key: "name"; header: string }[] = [{ key: "name", header: "이름" }]
const rows: Row[] = []

describe("DataGrid", () => {
  it("prioritizes the loading state over an empty result", () => {
    render(<DataGrid rows={rows} columns={columns} rowKey="id" loading />)
    expect(screen.getByText("데이터를 불러오는 중입니다.")).toBeInTheDocument()
    expect(screen.queryByText("표시할 데이터가 없습니다.")).not.toBeInTheDocument()
  })

  it("shows the provided empty-state message", () => {
    render(<DataGrid rows={rows} columns={columns} rowKey="id" emptyMessage="검색 결과 없음" />)
    expect(screen.getByText("검색 결과 없음")).toBeInTheDocument()
  })
})
