// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Dialog } from "@/shared/ui/dialog"

describe("Dialog", () => {
  it("shows title, content and actions when open", () => {
    render(
      <Dialog
        open
        title="정보 수정"
        description="필드를 변경할 수 있습니다."
        footer={<button type="button">저장</button>}
      >
        <p>수정할 내용</p>
      </Dialog>,
    )

    const dialog = screen.getByRole("dialog", { name: "정보 수정" })
    expect(dialog).toHaveTextContent("수정할 내용")
    expect(dialog).toHaveTextContent("필드를 변경할 수 있습니다.")
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument()
  })

  it("does not show its contents while closed", () => {
    render(<Dialog open={false} title="숨겨진 창"><p>비공개 내용</p></Dialog>)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
