// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ConfirmDialog } from "@/shared/ui/confirm-dialog"

describe("ConfirmDialog", () => {
  it("explains the operation and provides cancel and confirm choices", () => {
    render(
      <ConfirmDialog open title="삭제 확인" description="삭제 후 복구할 수 없습니다." onConfirm={vi.fn()} confirmLabel="삭제" />,
    )
    const dialog = screen.getByRole("alertdialog", { name: "삭제 확인" })
    expect(dialog).toHaveTextContent("삭제 후 복구할 수 없습니다.")
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument()
  })

  it("calls the action only when the user confirms", () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open title="삭제 확인" description="복구 불가" onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole("button", { name: "취소" }))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "확인" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
