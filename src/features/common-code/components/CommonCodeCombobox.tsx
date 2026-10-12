import { useAppTranslation } from "@/shared/i18n"

import type { CommonCodeGroupCode } from "@/features/common-code/constants/common-code-group"
import { useCommonCodeOptions } from "@/features/common-code/hooks/use-common-code-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"

export type CommonCodeComboboxProps = {
  groupCode: CommonCodeGroupCode
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
  "aria-describedby"?: string
}

export function CommonCodeCombobox({
  groupCode,
  value,
  onValueChange,
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: CommonCodeComboboxProps) {
  const { t } = useAppTranslation()
  const { options, isLoading, isError, isGroupUnavailable } = useCommonCodeOptions(groupCode)
  const unavailable = isError || isGroupUnavailable
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <div className="w-full min-w-0">
      <Combobox
        items={options}
        value={selected}
        onValueChange={(option) => onValueChange?.(option?.value ?? "")}
        isItemEqualToValue={(a, b) => a.value === b.value}
        disabled={disabled || isLoading || unavailable}
      >
        <ComboboxInput
          id={id}
          aria-label={ariaLabel ?? t("common-code:item.title")}
          aria-describedby={ariaDescribedBy}
          placeholder={isLoading ? t("common:states.loading") : placeholder ?? t("common:states.searchPlaceholder")}
          disabled={disabled || isLoading || unavailable}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>{t("common:states.empty")}</ComboboxEmpty>
          <ComboboxList>
            {(option) => (
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
      ) : unavailable ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {t(isGroupUnavailable ? "common-code:errors.groupNotFound" : "common:messages.requestFailure")}
        </p>
      ) : null}
    </div>
  )
}
