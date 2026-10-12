// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { TreeView } from "@/shared/ui/tree"
import type { TreeViewNode } from "@/shared/ui/tree"

const nodes: TreeViewNode[] = [
  { id: "system", label: "시스템 관리", icon: <span aria-hidden="true">F</span>, children: [
    { id: "user", label: "사용자 관리", icon: <span aria-hidden="true">P</span> },
  ] },
]

function ExampleTree() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])

  return (
    <TreeView
      nodes={nodes}
      selectedId={selectedId}
      collapsedIds={collapsedIds}
      onSelect={setSelectedId}
      onToggle={id => setCollapsedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id])}
      expandLabel={label => `${label} 펼치기`}
      collapseLabel={label => `${label} 접기`}
    />
  )
}

describe("shared TreeView", () => {
  it("keeps the toggle and selection within one visually grouped row", () => {
    render(<ExampleTree />)
    const select = screen.getByRole("button", { name: "시스템 관리" })
    const row = select.parentElement!

    expect(row).toHaveClass("flex")
    expect(within(row).getByRole("button", { name: "시스템 관리 접기" })).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(select)
    expect(select).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "사용자 관리" })).toBeInTheDocument()

    fireEvent.click(within(row).getByRole("button", { name: "시스템 관리 접기" }))
    expect(screen.queryByRole("button", { name: "사용자 관리" })).not.toBeInTheDocument()
    fireEvent.click(within(row).getByRole("button", { name: "시스템 관리 펼치기" }))
    expect(screen.getByRole("button", { name: "사용자 관리" })).toBeInTheDocument()
  })
})
