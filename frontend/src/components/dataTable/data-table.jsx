import { DataTablePagination } from './components/data-table-pagination'
import { DataTableViewOptions } from './components/column-toggle'
import { Search } from './components/data-table-search-filter'
import { ClientForm } from '../client/ClientForm'

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

import { Button } from '@/components/ui/button'

import { Plus } from 'lucide-react'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

import { Spinner } from '../ui/extensions/spinner'

import OverflowTooltip from '../ui/extensions/overflow-tooltip'

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

	const processedData = React.useMemo(() => {
		const groupedByDate = data.reduce((acc, curr) => {
			const date = curr.date
			if (!acc[date]) {
				acc[date] = []
			}
			acc[date].push(curr)
			return acc
		}, {})

		return Object.values(groupedByDate).flatMap((group) => {
			if (group.length > 1) {
				return group.sort(
					(a, b) => Number(b.joNumber) - Number(a.joNumber),
				)
			}
			return group
		})
	}, [data])

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
		return processedData.filter((row) => row.id !== highlightedRow)
	}, [processedData, highlightedRow])

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
				'hover:bg-background-hover',
				isPinned && 'bg-yellow-100 animate-pulse',
			)}
			onClick={() => {
				const { slugName } = row.original
				navigate(`/${type}/${slugName}`)
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{['address', 'fullName'].includes(cell.column.id) ? (
						<OverflowTooltip text={cell.getValue()} />
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
				{type === 'client' ? (
					<ClientForm
						onClientAdded={(newClientId) =>
							setHighlightedRow(newClientId)
						}
					/>
				) : (
					<Button
						variant="default"
						size="sm"
						className="ml-2 hidden h-8 lg:flex bg-action hover:bg-action-focus"
						onClick={() =>
							navigate(`${location.pathname}/transaction/add`)
						}
					>
						<Plus className="mr-1 h-4 w-4" />
						Add Transaction
					</Button>
				)}
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className="text-foreground"
									>
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
					<TableBody className="bg-card">
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
									className="h-24 text-center text-destructive"
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
