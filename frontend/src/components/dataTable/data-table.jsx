import { DataTablePagination } from './components/data-table-pagination'
import { DataTableViewOptions } from './components/column-toggle'
import { Search } from './components/data-table-search-filter'

import * as React from 'react'
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

import { Spinner } from '../ui/extensions/spinner'

export function DataTable({ columns, data, isLoading, error }) {
	const [sorting, setSorting] = React.useState([])
	const [columnFilters, setColumnFilters] = React.useState([])
	const [columnVisibility, setColumnVisibility] = React.useState({})
	const [globalFilter, setGlobalFilter] = React.useState('')

	const table = useReactTable({
		data,
		columns,
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

	return (
		<div>
			<div className="flex items-center py-4">
				<Search
					table={table}
					placeholder="Search..."
					clientFilter={true}
				/>
				<DataTableViewOptions table={table} />
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
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && 'selected'
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	)
}
