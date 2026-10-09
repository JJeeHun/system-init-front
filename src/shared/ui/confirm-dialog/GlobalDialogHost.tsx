import { useSyncExternalStore } from "react"

import { dialogStore } from "@/shared/lib/dialog"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"

export function GlobalDialogHost() {
  const request = useSyncExternalStore(dialogStore.subscribe, dialogStore.getSnapshot)

  if (!request) return null

  return (
    <ConfirmDialog
      open
      title={request.title}
      description={request.description}
      confirmLabel={request.confirmLabel}
      cancelLabel={request.cancelLabel}
      showCancel={request.kind === "confirm"}
      destructive={request.destructive}
      onConfirm={() => dialogStore.complete(true)}
      onOpenChange={(open) => {
        if (!open) dialogStore.complete(false)
      }}
    />
  )
}
