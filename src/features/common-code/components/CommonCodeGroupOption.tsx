import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"
import { Button } from "@/shared/ui/button"

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
    <Button
      primary={selected}
      size="sm"
      onClick={() => onSelect(group)}
      title={group.description || undefined}
    >
      <span className="flex min-w-0 w-full items-center justify-between gap-2 text-left">
        <span className="flex min-w-0 items-baseline gap-2">
          <strong className="min-w-0 truncate">{group.name}</strong>
          <span className="min-w-0 truncate text-xs font-normal opacity-75">
            {group.code}
          </span>
        </span>
        <span className="shrink-0 text-xs font-normal">
          {group.enabled ? "사용" : "미사용"}
        </span>
      </span>
    </Button>
  )
}
