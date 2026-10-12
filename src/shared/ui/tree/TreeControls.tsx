import { ChevronsDownUpIcon, ChevronsUpDownIcon, EllipsisIcon } from "lucide-react"

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/ui/button"
import { SearchField } from "@/shared/ui/search-field"

export type TreeControlsProps = {
  keyword: string
  onKeywordChange: (keyword: string) => void
  searchLabel: string
  searchPlaceholder: string
  expandAll: () => void
  collapseAll: () => void
  disabled?: boolean
}

export function TreeControls({
  keyword, onKeywordChange, searchLabel, searchPlaceholder,
  expandAll, collapseAll, disabled = false,
}: TreeControlsProps) {
  const { t } = useAppTranslation()
  const actionsDisabled = disabled || keyword.trim().length > 0

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0 flex-1">
        <SearchField
          aria-label={searchLabel}
          value={keyword}
          onValueChange={onKeywordChange}
          placeholder={searchPlaceholder}
          disabled={disabled}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" disabled={disabled} aria-label={t("common:tree.options")}
            title={t("common:tree.options")}>
            <EllipsisIcon aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={actionsDisabled} onSelect={expandAll}>
            <ChevronsUpDownIcon aria-hidden="true" />
            {t("common:tree.expandAll")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={actionsDisabled} onSelect={collapseAll}>
            <ChevronsDownUpIcon aria-hidden="true" />
            {t("common:tree.collapseAll")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
