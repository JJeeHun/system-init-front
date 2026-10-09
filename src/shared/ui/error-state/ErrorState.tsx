import { AlertCircleIcon } from "lucide-react"
import { useTranslation } from "@/shared/i18n"

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
  title,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <Empty role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title ?? t("common:states.errorTitle")}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button onClick={onRetry} loading={isRetrying} disabled={isRetrying}>
            {t("common:actions.retry")}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
