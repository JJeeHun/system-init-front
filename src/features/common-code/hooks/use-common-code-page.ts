import { useCommonCodeGroups } from "@/features/common-code/hooks/use-common-code-groups"
import { useCommonCodeItems } from "@/features/common-code/hooks/use-common-code-items"
import type { CommonCodeGroup } from "@/features/common-code/types/common-code.types"

export function useCommonCodePage() {
  const group = useCommonCodeGroups()
  const item = useCommonCodeItems(group.selectedGroup?.id ?? null)

  function selectGroup(selected: CommonCodeGroup) {
    group.selectGroup(selected)
    item.resetForGroupChange()
  }

  return {
    isGroupsLoading: group.isLoading,
    isItemsLoading: item.isLoading,
    groupsLoadErrorMessage: group.loadErrorMessage,
    itemsLoadErrorMessage: item.loadErrorMessage,
    groups: group.groups,
    selectedGroup: group.selectedGroup,
    items: item.items,
    selectedItem: item.selectedItem,
    selectGroup,
    selectItem: item.selectItem,
    groupForm: group.form,
    itemForm: item.form,
  }
}
