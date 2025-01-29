import { DataTablePagination } from './components/data-table-pagination'
import { DataTableViewOptions } from './components/column-toggle'
import { Search } from './components/data-table-search-filter'
import { ClientForm } from '../ClientForm'

import * as React from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	useReactTable,
} from '@tanstack/react-table'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

import { Spinner } from '../ui/extensions/spinner'

export function DataTable({ columns, data, isLoading, error, type = null }) {
	const navigate = useNavigate()

	const initialSorting =
		type === 'client'
			? [{ id: 'fullName', desc: false }]
			: [{ id: 'date', desc: true }]

	const [sorting, setSorting] = React.useState(initialSorting)
	const [columnFilters, setColumnFilters] = React.useState([])
	const [columnVisibility, setColumnVisibility] = React.useState({})
	const [globalFilter, setGlobalFilter] = React.useState('')
	const [highlightedRow, setHighlightedRow] = React.useState(null)

	React.useEffect(() => {
		if (highlightedRow) {
			const timeout = setTimeout(() => {
				setHighlightedRow(null)
			}, 3000)
			return () => clearTimeout(timeout)
		}
	}, [highlightedRow])

	const highlightedRowData = React.useMemo(() => {
		if (!highlightedRow) return null
		return data.find((row) => row.id === highlightedRow)
	}, [data, highlightedRow])

	const tableData = React.useMemo(() => {
		return data.filter((row) => row.id !== highlightedRow)
	}, [data, highlightedRow])

	const table = useReactTable({
		data: tableData,
		columns,
		enableMultiSort: false,
		autoResetPageIndex: false,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			globalFilter,
		},
	})

	const highlightedTable = useReactTable({
		data: highlightedRowData ? [highlightedRowData] : [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnVisibility,
		},
	})

	const renderTableRow = (row, isPinned = false) => (
		<TableRow
			key={row.id}
			data-state={row.getIsSelected() && 'selected'}
			className={clsx(
				'cursor-pointer',
				isPinned && 'bg-yellow-100 animate-pulse',
			)}
			onClick={() => navigate(`/${type}/${row.original.id}`)}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{cell.column.id === 'address' ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<span className="block max-w-[200px] truncate">
										{cell.getValue()}
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p>{cell.getValue()}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						flexRender(
							cell.column.columnDef.cell,
							cell.getContext(),
						)
					)}
				</TableCell>
			))}
		</TableRow>
	)

	return (
		<div>
			<div className="flex items-center py-4">
				<Search
					table={table}
					placeholder="Search..."
					clientFilter={type === 'client'}
				/>
				<DataTableViewOptions table={table} />
				{type === 'client' && (
					<ClientForm
						onClientAdded={(newClientId) =>
							setHighlightedRow(newClientId)
						}
					/>
				)}
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24"
								>
									<Spinner size="large">
										Loading data...
									</Spinner>
								</TableCell>
							</TableRow>
						) : error ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-red-500"
								>
									Failed to load clients data: {error}
								</TableCell>
							</TableRow>
						) : (
							<>
								{highlightedRowData &&
									highlightedTable
										.getRowModel()
										.rows.map((row) =>
											renderTableRow(row, true),
										)}

								{table.getRowModel().rows.length > 0 &&
									table
										.getRowModel()
										.rows.map((row) => renderTableRow(row))}

								{!highlightedRowData &&
									table.getRowModel().rows.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center"
											>
												No results.
											</TableCell>
										</TableRow>
									)}
							</>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	)
}
