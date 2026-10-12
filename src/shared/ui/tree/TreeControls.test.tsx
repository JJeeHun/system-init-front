// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TreeControls, TreeView, useTree } from "@/shared/ui/tree"
import type { TreeItem, TreeViewNode } from "@/shared/ui/tree"

type Node = TreeItem & { label: string; isGroup: boolean }
const items: Node[] = [
  { id: "root", parentId: null, label: "Root", isGroup: true },
  { id: "branch", parentId: "root", label: "Branch", isGroup: true },
  { id: "leaf", parentId: "branch", label: "Leaf", isGroup: false },
]
const getSearchText = (item: Node) => item.label
const isBranch = (item: Node) => item.isGroup

function asTree(visible: readonly Node[], parentId: string | null = null): TreeViewNode[] {
  return visible.filter(item => item.parentId === parentId).map(item => ({
    id: item.id, label: item.label,
    children: item.isGroup ? asTree(visible, item.id) : undefined,
  }))
}

function Example() {
  const tree = useTree({ items, getSearchText, isBranch })
  return (
    <>
      <TreeControls
        keyword={tree.keyword}
        onKeywordChange={tree.setKeyword}
        searchLabel="Tree search"
        searchPlaceholder="Find a node"
        expandAll={tree.expandAll}
        collapseAll={tree.collapseAll}
      />
      <TreeView nodes={asTree(tree.filteredItems)} selectedId={tree.selectedId}
        collapsedIds={tree.collapsedIds} forceExpanded={tree.forceExpanded}
        onSelect={tree.selectNode} onToggle={tree.toggleNode}
        expandLabel={label => `Expand ${label}`}
        collapseLabel={label => `Collapse ${label}`} />
    </>
  )
}

function openActions() {
  fireEvent.pointerDown(screen.getByRole("button", { name: "트리 메뉴 옵션" }), {
    button: 0, pointerType: "mouse", ctrlKey: false,
  })
}

describe("TreeControls", () => {
  it("expands and collapses all branches while preserving selection", async () => {
    render(<Example />)
    fireEvent.click(screen.getByRole("button", { name: "Leaf" }))
    expect(screen.getByRole("button", { name: "Leaf" })).toHaveAttribute("aria-pressed", "true")

    openActions()
    fireEvent.click(await screen.findByRole("menuitem", { name: "전체 접기" }))
    expect(screen.queryByRole("button", { name: "Leaf" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Expand Root" })).toHaveAttribute("aria-expanded", "false")

    openActions()
    fireEvent.click(await screen.findByRole("menuitem", { name: "전체 펼치기" }))
    expect(screen.getByRole("button", { name: "Leaf" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Collapse Branch" })).toHaveAttribute("aria-expanded", "true")
  })

  it("disables bulk actions while searching and restores prior collapse state on clear", async () => {
    render(<Example />)
    fireEvent.click(screen.getByRole("button", { name: "Collapse Branch" }))
    expect(screen.queryByRole("button", { name: "Leaf" })).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole("searchbox", { name: "Tree search" }), {
      target: { value: "leaf" },
    })
    expect(screen.getByRole("button", { name: "Leaf" })).toBeInTheDocument()

    openActions()
    expect(await screen.findByRole("menuitem", { name: "전체 접기" })).toHaveAttribute("data-disabled")
    expect(screen.getByRole("menuitem", { name: "전체 펼치기" })).toHaveAttribute("data-disabled")

    fireEvent.keyDown(document, { key: "Escape" })
    fireEvent.change(screen.getByRole("searchbox", { name: "Tree search" }), {
      target: { value: "" },
    })
    expect(screen.getByRole("button", { name: "Expand Branch" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("button", { name: "Leaf" })).not.toBeInTheDocument()
  })
})
