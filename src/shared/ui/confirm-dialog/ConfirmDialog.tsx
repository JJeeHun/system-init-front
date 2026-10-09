import type { ReactNode } from "react"

import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

export type ConfirmDialogProps = {
  title: ReactNode
  description: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  showCancel?: boolean
  destructive?: boolean
  trigger?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  confirmLabel = "확인",
  cancelLabel = "취소",
  showCancel = true,
  destructive = true,
  trigger,
  ...props
}: ConfirmDialogProps) {
  return (
    <ShadcnAlertDialog {...props}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel ? <AlertDialogCancel>{cancelLabel}</AlertDialogCancel> : null}
          <AlertDialogAction variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadcnAlertDialog>
  )
}
