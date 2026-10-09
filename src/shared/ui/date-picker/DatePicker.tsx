import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import { useAppTranslation } from "@/shared/i18n"
import { CalendarDaysIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import { Input } from "@/shared/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

export type DatePickerProps = {
  value: string
  onValueChange: (value: string) => void
  presentation?: "calendar" | "native"
  placeholder?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

export function DatePicker({
  value,
  onValueChange,
  presentation = "calendar",
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const { t, language } = useAppTranslation()

  if (presentation === "native") {
    return (
      <Input
        id={id}
        type="date"
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onValueChange(event.target.value)}
      />
    )
  }

  const parsedDate = value ? parseISO(value) : undefined
  const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarDaysIcon aria-hidden="true" />
          {selectedDate ? format(selectedDate, "yyyy.MM.dd") : (placeholder ?? t("common:states.datePlaceholder"))}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={language === "en" ? enUS : ko}
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onValueChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
