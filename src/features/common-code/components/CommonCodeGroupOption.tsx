import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"

type CommonCodeGroupOptionProps = {
  group: CommonCodeGroup
  selected: boolean
  onSelect: (group: CommonCodeGroup) => void
}

export function CommonCodeGroupOption({
  group,
  selected,
  onSelect,
}: CommonCodeGroupOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(group)}
      className={[
        "grid gap-1 rounded-md border p-3 text-left transition-colors",
        selected
          ? "border-primary-border bg-primary-soft"
          : "border-border bg-card hover:bg-surface-soft",
      ].join(" ")}
    >
      <span className="flex items-center justify-between gap-2">
        <strong className="text-sm text-foreground">{group.name}</strong>
        <span
          className={
            group.enabled
              ? "text-xs font-medium text-success"
              : "text-xs font-medium text-foreground-faint"
          }
        >
          {group.enabled ? "사용" : "미사용"}
        </span>
      </span>
      <span className="text-xs font-semibold text-primary">{group.code}</span>
      {group.description ? (
        <span className="line-clamp-2 text-xs text-foreground-soft">
          {group.description}
        </span>
      ) : null}
    </button>
  )
}
