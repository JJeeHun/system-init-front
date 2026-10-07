export type DataGridColumnSize = "sm" | "md" | "lg" | "fill"

export type DataGridColumnAlign = "left" | "center" | "right"

export type DataGridColumn<T extends object> = {
  key: Extract<keyof T, string>
  header: string
  size?: DataGridColumnSize
  align?: DataGridColumnAlign
  format?: (value: unknown, row: T) => string
}

export type DataGridProps<T extends object> = {
  rows: T[]
  columns: DataGridColumn<T>[]
  rowKey: Extract<keyof T, string>
  loading?: boolean
  emptyMessage?: string
  selectedRowKey?: string | null
  onRowClick?: (row: T) => void
}
