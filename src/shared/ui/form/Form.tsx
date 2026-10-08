import type { ComponentProps } from "react"

export type FormProps = ComponentProps<"form">

export function Form({ onSubmit, ...props }: FormProps) {
  const handleSubmit: NonNullable<FormProps["onSubmit"]> = (event) => {
    onSubmit?.(event)
  }

  return <form {...props} onSubmit={handleSubmit} />
}
