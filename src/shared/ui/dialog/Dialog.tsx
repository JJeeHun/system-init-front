import type { ReactNode } from "react"

import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"

export type DialogProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  trigger?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog({
  title,
  description,
  children,
  footer,
  trigger,
  ...props
}: DialogProps) {
  return (
    <ShadcnDialog {...props}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </ShadcnDialog>
  )
}
