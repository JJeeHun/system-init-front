import { Eye, EyeOff } from "lucide-react"
import { useState, type ComponentPropsWithRef } from "react"

import { useAppTranslation } from "@/shared/i18n"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group"

export type PasswordInputProps = Omit<ComponentPropsWithRef<"input">, "type">

export function PasswordInput({ disabled, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useAppTranslation()
  const actionLabel = t(visible ? "common:inputs.hidePassword" : "common:inputs.showPassword")

  return (
    <InputGroup className="h-12" data-disabled={disabled || undefined}>
      <InputGroupInput
        {...props}
        className={className}
        type={visible ? "text" : "password"}
        disabled={disabled}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-sm"
          disabled={disabled}
          aria-label={actionLabel}
          title={actionLabel}
          aria-pressed={visible}
          onMouseDown={event => event.preventDefault()}
          onClick={() => setVisible(value => !value)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
