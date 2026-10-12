// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"

import { PasswordInput } from "@/shared/ui/password-input"

describe("PasswordInput", () => {
  it("keeps its entered value and forwarded ref when visibility is toggled", () => {
    const ref = createRef<HTMLInputElement>()
    render(<PasswordInput aria-label="비밀번호" ref={ref} />)

    const input = screen.getByLabelText("비밀번호")
    expect(input).toHaveAttribute("type", "password")
    fireEvent.change(input, { target: { value: "secure-value" } })
    expect(input).toHaveValue("secure-value")
    expect(ref.current).toBe(input)

    fireEvent.click(screen.getByRole("button", { name: "보기" }))
    expect(input).toHaveAttribute("type", "text")
    expect(input).toHaveValue("secure-value")
    expect(screen.getByRole("button", { name: "숨기기" })).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(screen.getByRole("button", { name: "숨기기" }))
    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveValue("secure-value")
  })

  it("disables visibility toggling when its input is disabled", () => {
    render(<PasswordInput aria-label="비밀번호" disabled />)
    expect(screen.getByRole("button", { name: "보기" })).toBeDisabled()
  })
})
