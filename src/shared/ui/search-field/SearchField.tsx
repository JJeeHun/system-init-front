import { SearchIcon, XIcon } from "lucide-react"
import { useAppTranslation } from "@/shared/i18n"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group"

export type SearchFieldProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

export function SearchField({
  value,
  onValueChange,
  placeholder,
  disabled,
  ...inputProps
}: SearchFieldProps) {
  const { t } = useAppTranslation()
  return (
    <InputGroup data-disabled={disabled}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        {...inputProps}
        type="search"
        className="[&::-webkit-search-cancel-button]:hidden"
        value={value}
        placeholder={placeholder ?? t("common:states.searchPlaceholder")}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t("common:states.clearSearch")}
            disabled={disabled}
            onClick={() => onValueChange("")}
          >
            <XIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
