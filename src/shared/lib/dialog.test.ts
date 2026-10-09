import { afterEach, describe, expect, it } from "vitest"

import { dialog, dialogStore } from "@/shared/lib/dialog"

afterEach(() => {
  dialogStore.complete(false)
})

describe("global dialog manager", () => {
  it("allows one pending dialog and ignores simultaneous alert/confirm calls", async () => {
    const first = dialog.confirm({ title: "삭제 확인", description: "삭제할까요?" })
    const others = Array.from({ length: 9 }, () => dialog.confirm("중복 호출"))
    const ignoredAlert = dialog.alert("중복 알림")

    expect(dialogStore.getSnapshot()).toMatchObject({
      kind: "confirm",
      title: "삭제 확인",
      description: "삭제할까요?",
    })
    expect(await Promise.all(others)).toEqual(Array(9).fill(false))
    await ignoredAlert

    dialogStore.complete(true)
    await expect(first).resolves.toBe(true)
    expect(dialogStore.getSnapshot()).toBeNull()
  })

  it("resolves confirm with false when cancelled, without a queued dialog", async () => {
    const first = dialog.confirm("계속하시겠습니까?")
    const ignored = dialog.confirm("추가 호출")
    dialogStore.complete(false)

    await expect(first).resolves.toBe(false)
    await expect(ignored).resolves.toBe(false)
    expect(dialogStore.getSnapshot()).toBeNull()
  })

  it("waits for alert acknowledgement before completing, then permits the next request", async () => {
    let acknowledged = false
    const pending = dialog.alert("처리되었습니다.").then(() => {
      acknowledged = true
    })
    expect(acknowledged).toBe(false)
    expect(dialogStore.getSnapshot()?.kind).toBe("alert")

    dialogStore.complete(true)
    await pending
    expect(acknowledged).toBe(true)

    const next = dialog.confirm("새 확인")
    expect(dialogStore.getSnapshot()?.kind).toBe("confirm")
    dialogStore.complete(false)
    await expect(next).resolves.toBe(false)
  })

  it("notifies subscribers only on dialog changes", async () => {
    let notifications = 0
    const unsubscribe = dialogStore.subscribe(() => { notifications += 1 })
    const pending = dialog.confirm("하나")
    await dialog.confirm("무시")
    expect(notifications).toBe(1)

    dialogStore.complete(true)
    await pending
    expect(notifications).toBe(2)
    unsubscribe()
  })
})
