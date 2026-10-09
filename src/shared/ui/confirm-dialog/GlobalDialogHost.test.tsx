// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { dialog, dialogStore } from "@/shared/lib/dialog"
import { GlobalDialogHost } from "@/shared/ui/confirm-dialog/GlobalDialogHost"

afterEach(() => {
  act(() => dialogStore.complete(false))
})

describe("GlobalDialogHost", () => {
  it("shows an alert with one acknowledgement button", async () => {
    render(<GlobalDialogHost />)
    let response: Promise<void> = Promise.resolve()
    act(() => { response = dialog.alert("완료되었습니다.") })

    expect(screen.getByRole("alertdialog", { name: "알림" })).toHaveTextContent("완료되었습니다.")
    expect(screen.queryByRole("button", { name: "취소" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "확인" }))
    await response
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("cancels a confirm without executing the confirmed branch", async () => {
    render(<GlobalDialogHost />)
    let response: Promise<boolean> = Promise.resolve(false)
    act(() => { response = dialog.confirm({ description: "정말 삭제할까요?", confirmLabel: "삭제" }) })

    expect(screen.getByRole("alertdialog", { name: "확인" })).toHaveTextContent("정말 삭제할까요?")
    fireEvent.click(screen.getByRole("button", { name: "취소" }))
    await expect(response).resolves.toBe(false)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("confirms and resolves with true when the action is clicked", async () => {
    render(<GlobalDialogHost />)
    let response: Promise<boolean> = Promise.resolve(false)
    act(() => { response = dialog.confirm({ description: "그룹을 삭제하시겠습니까?", confirmLabel: "삭제" }) })

    fireEvent.click(screen.getByRole("button", { name: "삭제" }))
    await expect(response).resolves.toBe(true)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
})
