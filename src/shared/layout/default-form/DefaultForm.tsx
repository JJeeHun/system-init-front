import type { ReactNode } from "react"

import { Form } from "@/shared/ui/form"
import type { FormProps } from "@/shared/ui/form"

type DefaultFormActionsProps = {
  children: ReactNode
  align?: "left" | "center" | "right"
}

const actionAlignment = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const

function DefaultFormActions({
  children,
  align = "right",
}: DefaultFormActionsProps) {
  return (
    <div className={["col-span-full flex flex-wrap items-center gap-2", actionAlignment[align]].join(" ")}>
      {children}
    </div>
  )
}

export function DefaultForm({ className, ...props }: FormProps) {
  return (
    <div className="@container">
      <Form
        {...props}
        className={[
          "grid grid-cols-1 gap-form-gap p-form @md:grid-cols-2 @4xl:grid-cols-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  )
}

DefaultForm.Actions = DefaultFormActions
