import { SearchIcon, XIcon } from "lucide-react"

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
  placeholder = "검색어 입력",
  disabled,
  ...inputProps
}: SearchFieldProps) {
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
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="검색어 초기화"
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
