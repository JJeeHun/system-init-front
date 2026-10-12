// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { TreeView } from "@/shared/ui/tree"

function PermissionTree() {
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>("users")
  return (
    <TreeView
      nodes={[{ id: "system", label: "시스템 관리", children: [
        { id: "users", label: "사용자 관리" },
      ] }]}
      selectedId={selectedId}
      collapsedIds={collapsedIds}
      groupToggleOnly
      onSelect={setSelectedId}
      onToggle={id => setCollapsedIds(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id])}
      expandLabel={label => `${label} 펼치기`}
      collapseLabel={label => `${label} 접기`}
    />
  )
}

describe("TreeView group toggle only mode", () => {
  it("uses one clickable group row to toggle while keeping page selection separate", () => {
    render(<PermissionTree />)
    const group = screen.getByRole("button", { name: "시스템 관리" })
    expect(group).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "사용자 관리" })).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(group)
    expect(group).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("button", { name: "사용자 관리" })).not.toBeInTheDocument()

    fireEvent.click(group)
    expect(group).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "사용자 관리" })).toHaveAttribute("aria-pressed", "true")
  })
})
