import { AgGridDataGrid } from "@/shared/ui/data-grid/internal/AgGridDataGrid"
import type { DataGridProps } from "@/shared/ui/data-grid/data-grid.types"

export function DataGrid<T extends object>({
  loading = false,
  emptyMessage = "표시할 데이터가 없습니다.",
  ...props
}: DataGridProps<T>) {
  if (loading) {
    return (
      <div className="grid h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full place-items-center rounded-md border border-border bg-card text-sm text-foreground-soft">
        데이터를 불러오는 중입니다.
      </div>
    )
  }

  if (props.rows.length === 0) {
    return (
      <div className="grid h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full place-items-center rounded-md border border-border bg-card px-4 text-center text-sm text-foreground-soft">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="h-[var(--layout-grid-height)] min-h-48 min-w-0 w-full overflow-x-auto rounded-md">
      <AgGridDataGrid {...props} />
    </div>
  )
}
