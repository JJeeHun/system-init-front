import type { ComponentProps, FormEvent } from "react"

export type FormProps = ComponentProps<"form">

export function Form({ onSubmit, ...props }: FormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit?.(event)
  }

  return <form {...props} onSubmit={handleSubmit} />
}
