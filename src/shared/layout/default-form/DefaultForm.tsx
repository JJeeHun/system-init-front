import { Form } from "@/shared/ui/form"
import type { FormProps } from "@/shared/ui/form"

export function DefaultForm({ className, ...props }: FormProps) {
  return (
    <div className="@container">
      <Form
        {...props}
        className={[
          "grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  )
}
