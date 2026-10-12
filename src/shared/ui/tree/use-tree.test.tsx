// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TreeView, useTree } from "@/shared/ui/tree"
import type { TreeItem, TreeViewNode } from "@/shared/ui/tree"

type ExampleItem = TreeItem & {
  title: string
  path: string
  branch: boolean
}

const items: ExampleItem[] = [
  { id: "system", parentId: null, title: "System", path: "", branch: true },
  { id: "people", parentId: "system", title: "People", path: "", branch: true },
  { id: "users", parentId: "people", title: "Users", path: "/app/users", branch: false },
  { id: "roles", parentId: "people", title: "Roles", path: "/app/roles", branch: false },
  { id: "settings", parentId: "system", title: "Settings", path: "", branch: true },
  { id: "codes", parentId: "settings", title: "Codes", path: "/app/codes", branch: false },
]

function getSearchText(item: ExampleItem) {
  return [item.title, item.id, item.path].join(" ")
}
function isBranch(item: ExampleItem) {
  return item.branch
}
function toNodes(visible: readonly ExampleItem[], parentId: string | null = null): TreeViewNode[] {
  return visible.filter(item => item.parentId === parentId).map(item => ({
    id: item.id,
    label: item.title,
    children: item.branch ? toNodes(visible, item.id) : undefined,
  }))
}

function ExampleTree() {
  const tree = useTree({ items, getSearchText, isBranch })
  return (
    <>
      <input
        type="search"
        aria-label="Search tree"
        value={tree.keyword}
        onChange={event => tree.setKeyword(event.target.value)}
      />
      <button onClick={() => tree.setKeyword("")}>Clear</button>
      <span data-testid="selected">{tree.selectedId ?? "none"}</span>
      <TreeView
        nodes={toNodes(tree.filteredItems)}
        selectedId={tree.selectedId}
        collapsedIds={tree.collapsedIds}
        forceExpanded={tree.forceExpanded}
        onSelect={tree.selectNode}
        onToggle={tree.toggleNode}
        expandLabel={label => `Expand ${label}`}
        collapseLabel={label => `Collapse ${label}`}
      />
    </>
  )
}

describe("useTree", () => {
  it("owns selection and branch expansion without requiring a feature hook", () => {
    render(<ExampleTree />)
    fireEvent.click(screen.getByRole("button", { name: "Users" }))
    expect(screen.getByTestId("selected")).toHaveTextContent("users")
    expect(screen.getByRole("button", { name: "Users" })).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(screen.getByRole("button", { name: "Collapse People" }))
    expect(screen.queryByRole("button", { name: "Users" })).not.toBeInTheDocument()
    expect(screen.getByTestId("selected")).toHaveTextContent("users")

    fireEvent.click(screen.getByRole("button", { name: "Expand People" }))
    expect(screen.getByRole("button", { name: "Users" })).toBeInTheDocument()
  })

  it("searches an item with ancestors and excludes unrelated siblings", () => {
    render(<ExampleTree />)
    fireEvent.change(screen.getByRole("searchbox", { name: "Search tree" }), {
      target: { value: "/APP/ROLES" },
    })
    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "People" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Roles" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Users" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument()
  })

  it("keeps matching branch descendants and restores collapse after clearing search", () => {
    render(<ExampleTree />)
    fireEvent.click(screen.getByRole("button", { name: "Collapse People" }))
    expect(screen.queryByRole("button", { name: "Users" })).not.toBeInTheDocument()

    const search = screen.getByRole("searchbox", { name: "Search tree" })
    fireEvent.change(search, { target: { value: "people" } })
    expect(screen.getByRole("button", { name: "Users" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Roles" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Collapse People" })).toBeDisabled()

    fireEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(search).toHaveValue("")
    expect(screen.getByRole("button", { name: "Expand People" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("button", { name: "Users" })).not.toBeInTheDocument()
  })
})
