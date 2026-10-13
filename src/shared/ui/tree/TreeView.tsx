import type { ReactNode } from "react"

import { ChevronRightIcon } from "lucide-react"

import { selectedItemClassName } from "@/shared/ui/selection/selected-item"

export type TreeViewNode = {
  id: string
  label: string
  icon?: ReactNode
  title?: string
  trailingText?: string
  children?: TreeViewNode[]
}

export type TreeViewProps = {
  nodes: TreeViewNode[]
  selectedId: string | null
  collapsedIds: string[]
  forceExpanded?: boolean
  groupToggleOnly?: boolean
  disabled?: boolean
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  expandLabel: (label: string) => string
  collapseLabel: (label: string) => string
}

function TreeItems({ nodes, ...props }: TreeViewProps) {
  return (
    <ul className="grid min-w-0 list-none gap-0.5">
      {nodes.map(node => {
        const isGroup = node.children !== undefined
        const expanded = props.forceExpanded || !props.collapsedIds.includes(node.id)
        const selected = props.selectedId === node.id

        return (
          <li key={node.id} className="min-w-0">
            {isGroup && props.groupToggleOnly ? (
              <button
                type="button"
                aria-label={node.label}
                aria-expanded={expanded}
                title={node.title ?? node.label}
                disabled={props.disabled || props.forceExpanded}
                onClick={() => props.onToggle(node.id)}
                className="flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface-soft focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
              >
                <ChevronRightIcon aria-hidden="true" className={`size-4 shrink-0 text-foreground-soft transition-transform ${expanded ? "rotate-90" : ""}`} />
                {node.icon ? <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center text-foreground-soft">{node.icon}</span> : null}
                <span className="min-w-0 flex-1 truncate">{node.label}</span>
                {node.trailingText ? <span className="shrink-0 text-xs font-normal text-foreground-soft">{node.trailingText}</span> : null}
              </button>
            ) : (
            <div className={[
              "group/tree-item flex min-w-0 items-center rounded-md transition-colors",
              selected ? selectedItemClassName : "text-foreground hover:bg-surface-soft",
            ].join(" ")}>
              {isGroup ? (
                <button
                  type="button"
                  aria-label={expanded ? props.collapseLabel(node.label) : props.expandLabel(node.label)}
                  aria-expanded={expanded}
                  disabled={props.disabled || props.forceExpanded}
                  onClick={() => props.onToggle(node.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-soft outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
                >
                  <ChevronRightIcon aria-hidden="true" className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              ) : (
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center">
                  <span className="h-px w-2 bg-border" />
                </span>
              )}
              <button
                type="button"
                aria-pressed={selected}
                title={node.title ?? node.label}
                disabled={props.disabled}
                onClick={() => props.onSelect(node.id)}
                className={[
                  "flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md py-1 pr-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60",
                  isGroup ? "font-semibold" : "font-normal",
                ].join(" ")}
              >
                {node.icon ? <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center text-foreground-soft">{node.icon}</span> : null}
                <span className="min-w-0 flex-1 truncate">{node.label}</span>
                {node.trailingText ? <span className="shrink-0 text-xs font-normal text-foreground-soft">{node.trailingText}</span> : null}
              </button>
            </div>
            )}
            {isGroup && expanded && node.children?.length ? (
              <div className="ml-4 min-w-0 border-l border-border pl-3 pt-0.5">
                <TreeItems nodes={node.children} {...props} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function TreeView(props: TreeViewProps) {
  return <TreeItems {...props} />
}
