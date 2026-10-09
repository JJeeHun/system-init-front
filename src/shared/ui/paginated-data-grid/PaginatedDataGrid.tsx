import { DataGrid } from "@/shared/ui/data-grid"
import type { DataGridProps } from "@/shared/ui/data-grid"
import { Pagination } from "@/shared/ui/pagination"
import type { PaginationProps } from "@/shared/ui/pagination"

type PaginatedDataGridProps<T extends object> = DataGridProps<T> & Omit<PaginationProps, "disabled"> & {
  paginationDisabled?: boolean
}

export function PaginatedDataGrid<T extends object>({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  paginationDisabled,
  ...gridProps
}: PaginatedDataGridProps<T>) {
  return (
    <div className="grid min-w-0 gap-3">
      <DataGrid {...gridProps} />
      <Pagination page={page} pageSize={pageSize} totalCount={totalCount}
        onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
        disabled={paginationDisabled || gridProps.loading} />
    </div>
  )
}
