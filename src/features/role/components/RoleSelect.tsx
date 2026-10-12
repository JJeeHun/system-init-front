import { useRoleOptions } from "@/features/role/hooks/use-role-options"

import { useAppTranslation } from "@/shared/i18n"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"

type RoleOption = {
  value: string
  label: string
}

export type RoleSelectProps = {
  value?: string
  onValueChange?: (value: string) => void
  allOption?: RoleOption
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

export function RoleSelect({
  value,
  onValueChange,
  allOption,
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: RoleSelectProps) {
  const { t } = useAppTranslation()
  const { options: roles, isLoading, isError } = useRoleOptions()
  const options = allOption ? [allOption, ...roles] : roles
  const selected = options.find(option => option.value === value) ?? null

  return (
    <div className="w-full min-w-0">
      <Combobox
        items={options}
        value={selected}
        onValueChange={option => onValueChange?.(option?.value ?? "")}
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringValue={option => option.label}
        disabled={disabled || isLoading || isError}
      >
        <ComboboxInput
          id={id}
          aria-label={ariaLabel ?? t("role:fields.name")}
          aria-describedby={ariaDescribedBy}
          placeholder={isLoading ? t("common:states.loading") : placeholder ?? t("common:states.searchPlaceholder")}
          disabled={disabled || isLoading || isError}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>{t("role:list.empty")}</ComboboxEmpty>
          <ComboboxList>
            {option => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {isLoading ? (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          {t("common:states.loading")}
        </p>
      ) : isError ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {t("role:messages.rolesError")}
        </p>
      ) : null}
    </div>
  )
}
