import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"

import { useAppTranslation } from "@/shared/i18n"
import { Button } from "@/shared/ui/button"
import { Select } from "@/shared/ui/select"

const PAGE_SIZES = [20, 50, 100]

export type PaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  disabled?: boolean
}

export function Pagination({ page, pageSize, totalCount, onPageChange, onPageSizeChange, disabled = false }: PaginationProps) {
  const { t } = useAppTranslation()
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalCount)
  const firstPageInRange = Math.max(1, Math.min(page - 2, pageCount - 4))
  const visiblePages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPageInRange + index)
  const prevDisabled = disabled || page <= 1
  const nextDisabled = disabled || page >= pageCount

  return (
    <nav aria-label={t("common:pagination.pageSize")} className="flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm text-foreground-soft">
      <span>{t("common:pagination.range", { start: firstItem, end: lastItem, total: totalCount })}</span>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button size="sm" disabled={prevDisabled} aria-label={t("common:pagination.first")} onClick={() => onPageChange(1)}><ChevronFirst className="size-4" /></Button>
          <Button size="sm" disabled={prevDisabled} aria-label={t("common:pagination.previous")} onClick={() => onPageChange(page - 1)}><ChevronLeft className="size-4" /></Button>
          {visiblePages.map(number => (
            <Button key={number} size="sm" primary={number === page} disabled={disabled}
              aria-label={t("common:pagination.gotoPage", { page: number })}
              aria-current={number === page ? "page" : undefined}
              onClick={() => onPageChange(number)}>{number}</Button>
          ))}
          <Button size="sm" disabled={nextDisabled} aria-label={t("common:pagination.next")} onClick={() => onPageChange(page + 1)}><ChevronRight className="size-4" /></Button>
          <Button size="sm" disabled={nextDisabled} aria-label={t("common:pagination.last")} onClick={() => onPageChange(pageCount)}><ChevronLast className="size-4" /></Button>
        </div>
        <span>{t("common:pagination.pageSize")}</span>
        <div className="w-24">
          <Select aria-label={t("common:pagination.pageSize")} value={String(pageSize)} disabled={disabled}
            options={PAGE_SIZES.map(size => ({ value: String(size), label: String(size) }))}
            onValueChange={value => onPageSizeChange(Number(value))} />
        </div>
      </div>
    </nav>
  )
}
