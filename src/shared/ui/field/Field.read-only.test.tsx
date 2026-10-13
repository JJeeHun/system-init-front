// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field } from "@/shared/ui/field"
import { Input } from "@/shared/components/ui/input"

describe("read-only form field", () => {
  it("shows an edit-only lock and explanation while keeping its value selectable", () => {
    const { container } = render(
      <Field readOnly label="코드" htmlFor="code" description="등록 후 변경할 수 없는 항목입니다.">
        <Input id="code" readOnly defaultValue="SYS_STATUS" aria-describedby="code-description" />
      </Field>,
    )
    const input = screen.getByRole("textbox", { name: "코드" }) as HTMLInputElement

    expect(input).toHaveAttribute("readonly")
    expect(input).not.toBeDisabled()
    expect(input).toHaveValue("SYS_STATUS")
    expect(input).toHaveAttribute("aria-describedby", "code-description")
    expect(screen.getByText("등록 후 변경할 수 없는 항목입니다.")).toBeInTheDocument()
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
    expect(input).toHaveClass("read-only:bg-muted")
    input.focus()
    input.select()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe("SYS_STATUS".length)
  })

  it("keeps the required indicator for a writable creation field", () => {
    const { container } = render(
      <Field required label="코드" htmlFor="new-code">
        <Input id="new-code" defaultValue="" />
      </Field>,
    )
    expect(screen.getByRole("textbox", { name: /코드/ })).not.toHaveAttribute("readonly")
    expect(screen.getByText("필수")).toHaveClass("sr-only")
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeInTheDocument()
  })
})
