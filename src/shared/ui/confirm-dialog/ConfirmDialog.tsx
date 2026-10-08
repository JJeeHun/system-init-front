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
  trigger,
  ...props
}: ConfirmDialogProps) {
  return (
    <ShadcnAlertDialog {...props}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ShadcnAlertDialog>
  )
}
