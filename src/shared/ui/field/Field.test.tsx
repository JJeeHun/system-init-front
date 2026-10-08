// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field } from "@/shared/ui/field"

describe("Field", () => {
  it("associates the label with its control and shows required help text", () => {
    render(
      <Field label="이름" htmlFor="name" required description="실명을 입력하세요.">
        <input id="name" />
      </Field>,
    )

    expect(screen.getByRole("textbox", { name: /이름/ })).toBeInTheDocument()
    expect(screen.getByText("필수")).toHaveClass("sr-only")
    expect(screen.getByText("실명을 입력하세요.")).toHaveAttribute("id", "name-description")
  })

  it("renders validation errors as an alert", () => {
    render(
      <Field label="이름" htmlFor="name" error="이름을 입력하세요.">
        <input id="name" />
      </Field>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("이름을 입력하세요.")
    expect(screen.getByRole("alert")).toHaveAttribute("id", "name-error")
  })
})
