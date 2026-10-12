import { useCallback, useMemo, useState } from "react"

export type TreeItem = {
  id: string
  parentId: string | null
}

export type UseTreeOptions<T extends TreeItem> = {
  items: readonly T[]
  getSearchText: (item: T) => string
  isBranch: (item: T) => boolean
}

export function useTree<T extends TreeItem>({
  items,
  getSearchText,
  isBranch,
}: UseTreeOptions<T>) {
  const [keyword, setKeyword] = useState("")
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const forceExpanded = keyword.trim().length > 0

  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLocaleLowerCase()
    if (!search) return items

    const byId = new Map(items.map((item) => [item.id, item]))
    const childrenByParent = new Map<string, T[]>()
    for (const item of items) {
      if (!item.parentId) continue
      const children = childrenByParent.get(item.parentId) ?? []
      children.push(item)
      childrenByParent.set(item.parentId, children)
    }

    const visibleIds = new Set<string>()
    for (const item of items) {
      if (!getSearchText(item).toLocaleLowerCase().includes(search)) continue

      let current: T | undefined = item
      const ancestors = new Set<string>()
      while (current && !ancestors.has(current.id)) {
        ancestors.add(current.id)
        visibleIds.add(current.id)
        current = current.parentId ? byId.get(current.parentId) : undefined
      }

      if (isBranch(item)) {
        const pending = [item.id]
        const visited = new Set<string>()
        while (pending.length) {
          const parentId = pending.pop()!
          if (visited.has(parentId)) continue
          visited.add(parentId)
          for (const child of childrenByParent.get(parentId) ?? []) {
            visibleIds.add(child.id)
            if (isBranch(child)) pending.push(child.id)
          }
        }
      }
    }

    return items.filter((item) => visibleIds.has(item.id))
  }, [items, keyword, getSearchText, isBranch])

  const toggleNode = useCallback((id: string) => {
    setCollapsedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }, [])

  const selectNode = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  return {
    keyword,
    setKeyword,
    filteredItems,
    selectedId,
    selectNode,
    collapsedIds,
    toggleNode,
    forceExpanded,
  }
}
