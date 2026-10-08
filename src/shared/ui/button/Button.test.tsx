// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/shared/ui/button"

describe("Button", () => {
  it("allows a normal user click", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>저장</Button>)

    await userEvent.click(screen.getByRole("button", { name: "저장" }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it("prevents interaction and announces busy state while loading", async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>저장</Button>)

    const button = screen.getByRole("button", { name: "저장" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("honors explicit disabled state even when not loading", () => {
    render(<Button disabled>삭제</Button>)
    expect(screen.getByRole("button", { name: "삭제" })).toBeDisabled()
  })
})
