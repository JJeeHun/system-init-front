import { useMemo } from "react"
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community"
import type { ColDef, RowClassParams } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"

import type { DataGridProps } from "@/shared/ui/data-grid/data-grid.types"
import "@/shared/ui/data-grid/data-grid.css"

ModuleRegistry.registerModules([ClientSideRowModelModule])

const appGridTheme = themeQuartz.withParams({
  accentColor: "var(--primary)",
  backgroundColor: "var(--card)",
  borderColor: "var(--table-border)",
  foregroundColor: "var(--foreground)",
  fontFamily: "var(--font-default)",
  headerBackgroundColor: "var(--table-header)",
  headerTextColor: "var(--foreground)",
  rowHoverColor: "var(--table-row-hover)",
  selectedRowBackgroundColor: "var(--table-row-selected)",
})

const columnSizeConfig = {
  sm: { width: 96 },
  md: { width: 144 },
  lg: { width: 192 },
  fill: { flex: 1, minWidth: 220 },
} as const

const columnAlignClass = {
  left: undefined,
  center: "app-data-grid__cell--center",
  right: "app-data-grid__cell--right",
} as const

export function AgGridDataGrid<T extends object>({
  rows,
  columns,
  rowKey,
  selectedRowKey,
  onRowClick,
}: DataGridProps<T>) {
  const columnDefs = useMemo<ColDef<T>[]>(
    () =>
      columns.map((column) => ({
        colId: column.key,
        headerName: column.header,
        valueGetter: (params) => params.data?.[column.key],
        valueFormatter: column.format
          ? (params) =>
              params.data ? column.format?.(params.value, params.data) ?? "" : ""
          : undefined,
        cellClass: columnAlignClass[column.align ?? "left"],
        ...columnSizeConfig[column.size ?? "md"],
      })),
    [columns],
  )

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      cellDataType: false,
      filter: false,
      resizable: false,
      sortable: false,
      suppressMovable: true,
    }),
    [],
  )

  const rowClassRules = useMemo(
    () => ({
      "app-data-grid__row--selected": (params: RowClassParams<T>) =>
        selectedRowKey != null &&
        params.data != null &&
        String(params.data[rowKey]) === selectedRowKey,
    }),
    [rowKey, selectedRowKey],
  )

  return (
    <div className="app-data-grid h-full w-full">
      <AgGridReact<T>
        theme={appGridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => String(params.data[rowKey])}
        rowClassRules={rowClassRules}
        onRowClicked={(event) => {
          if (event.data) {
            onRowClick?.(event.data)
          }
        }}
      />
    </div>
  )
}
