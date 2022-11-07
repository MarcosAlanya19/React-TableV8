import {
  compareItems, RankingInfo,
  rankItem
} from '@tanstack/match-sorter-utils'
import {
  Column, ColumnFiltersState, createColumnHelper, FilterFn, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel,
  getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Headers, SortingFn, sortingFns, Table,
  useReactTable
} from '@tanstack/react-table'
import React from 'react'
import { DataTest, dataTesting } from './data'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Clasifica el elemento
  const itemRank = rankItem(row.getValue(columnId), value)

  // Almacenar la información de itemRank
  addMeta({
    itemRank,
  })

  // Devolver si el elemento se debe filtrar dentro/fuera
  return itemRank.passed
}

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

const App = () => {
  const rerender = React.useReducer(() => ({}), {})[1]

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columnHelper = createColumnHelper<DataTest>();
  const columns = [
    columnHelper.accessor("id", {
      header: () => "N°",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("attributes.name", {
      header: () => "Nombre",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("attributes.country", {
      header: () => "País",
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor("attributes.dni", {
      header: "DNI",
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor("attributes.registrationDate", {
      header: "Fecha de registro",
      cell: (info) => info.renderValue(),
    }),

    columnHelper.accessor("attributes.status", {
      header: "Estado",
      cell: (info) => info.renderValue(),
      enableColumnFilter: true,
    }),

    columnHelper.accessor("attributes.actions", {
      header: "Acciones",
      cell(info) {
        info.renderValue()
        return <a href={`/test/${info.cell.row._valuesCache.id}`}> Ver perfil </a>;
      },
    }),
  ];

  const [data, setData] = React.useState(() => [...dataTesting]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: false,
  })

  return (
    <div className="p-2">
      <div>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
        {/* <DebouncedInput2
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block"
        /> */}



      </div>
      <div className="h-2" />
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>

                        <Filter column={header.column} table={table} />

                      </>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[5, 10, 15, 20, 25].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
    </div>
  )
}

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = React.useMemo(
    () =>
      Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  )
  console.log(column.columnDef.header);

  return (column.columnDef.header === 'Estado') && (
    <>
      <DebouncedInput2
        type="text"
        value={(columnFilterValue) as string}
        onChange={value => column.setFilterValue(value)}
        className="w-36 border shadow rounded"
        list={column.id + 'list'}
      />
    </>
  )
}

// function Filter({
//   column,
//   table,
// }: {
//   column: Column<any, unknown>
//   table: Table<any>
// }) {
//   const firstValue = table
//     .getPreFilteredRowModel()
//     .flatRows[0]?.getValue(column.id)

//   const columnFilterValue = column.getFilterValue()

//   const sortedUniqueValues = React.useMemo(
//     () =>
//       typeof firstValue === 'number'
//         ? []
//         : Array.from(column.getFacetedUniqueValues().keys()).sort(),
//     [column.getFacetedUniqueValues()]
//   )

//   return typeof firstValue === 'number' ? (
//     <div>
//       <div className="flex space-x-2">
//         <DebouncedInput
//           type="number"
//           min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
//           max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
//           value={(columnFilterValue as [number, number])?.[0] ?? ''}
//           onChange={value =>
//             column.setFilterValue((old: [number, number]) => [value, old?.[1]])
//           }
//           placeholder={`Min ${column.getFacetedMinMaxValues()?.[0]
//               ? `(${column.getFacetedMinMaxValues()?.[0]})`
//               : ''
//             }`}
//           className="w-24 border shadow rounded"
//         />
//         <DebouncedInput
//           type="number"
//           min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
//           max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
//           value={(columnFilterValue as [number, number])?.[1] ?? ''}
//           onChange={value =>
//             column.setFilterValue((old: [number, number]) => [old?.[0], value])
//           }
//           placeholder={`Max ${column.getFacetedMinMaxValues()?.[1]
//               ? `(${column.getFacetedMinMaxValues()?.[1]})`
//               : ''
//             }`}
//           className="w-24 border shadow rounded"
//         />
//       </div>
//       <div className="h-1" />
//     </div>
//   ) : (
//     <>
//       <datalist id={column.id + 'list'}>
//         {sortedUniqueValues.slice(0, 5000).map((value: any) => (
//           <option value={value} key={value} />
//         ))}
//       </datalist>
//       <DebouncedInput
//         type="text"
//         value={(columnFilterValue ?? '') as string}
//         onChange={value => column.setFilterValue(value)}
//         placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
//         className="w-36 border shadow rounded"
//         list={column.id + 'list'}
//       />
//       <div className="h-1" />
//     </>
//   )
// }

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

function DebouncedInput2({
  value: initialValueSelect,
  onChange,
  debounce = 500,
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [valueSelect, setValueSelect] = React.useState(initialValueSelect)

  React.useEffect(() => {
    setValueSelect(initialValueSelect)
  }, [initialValueSelect])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(valueSelect)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [valueSelect])

  return (
    <select onChange={e => setValueSelect(e.target.value)}>
      <option value={''} >Estado</option>
      <option value={'Activo'} >Activo</option>
      <option value={'Pendiente'}>Pendiete</option>
      <option value={'Suspendido'}>Suspendido</option>
    </select>
  )
}

export default App
