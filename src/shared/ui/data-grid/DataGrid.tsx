import { useTranslation } from "@/shared/i18n"
import { AgGridDataGrid } from "@/shared/ui/data-grid/internal/AgGridDataGrid"
import type { DataGridProps } from "@/shared/ui/data-grid/data-grid.types"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function DataGrid<T extends object>({
  loading = false,
  emptyMessage,
  ...props
}: DataGridProps<T>) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div role="status" aria-label={t("common:states.gridLoading")} className="h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full overflow-hidden rounded-md border border-border bg-card">
        <span className="sr-only">데이터를 불러오는 중입니다.</span>
        <div className="flex gap-4 border-b border-border bg-surface-soft p-3">
          {props.columns.map((column) => (
            <Skeleton key={column.key} className="h-4 min-w-0 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex gap-4 border-b border-border p-3">
            {props.columns.map((column) => (
              <Skeleton key={column.key} className="h-4 min-w-0 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (props.rows.length === 0) {
    return (
      <div className="grid h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full place-items-center rounded-md border border-border bg-card px-4 text-center text-sm text-foreground-soft">
        {emptyMessage ?? t("common:states.empty")}
      </div>
    )
  }

  return (
    <div className="h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full overflow-x-auto rounded-md">
      <AgGridDataGrid {...props} />
    </div>
  )
}
