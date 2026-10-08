import { AlertCircleIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty"
import { Button } from "@/shared/ui/button"

export type ErrorStateProps = {
  message: string
  title?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function ErrorState({
  message,
  title = "오류가 발생했습니다",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <Empty role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button onClick={onRetry} loading={isRetrying} disabled={isRetrying}>
            다시 시도
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
