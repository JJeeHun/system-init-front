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
      size="lg"
      onClick={() => onSelect(group)}
    >
      <span className="grid w-full gap-1 text-left">
        <span className="flex items-center justify-between gap-2">
          <strong>{group.name}</strong>
          <span className={group.enabled ? "text-success" : "text-foreground-faint"}>
            {group.enabled ? "사용" : "미사용"}
          </span>
        </span>
        <span>{group.code}</span>
        {group.description ? (
          <span className="line-clamp-2 font-normal">{group.description}</span>
        ) : null}
      </span>
    </Button>
  )
}
