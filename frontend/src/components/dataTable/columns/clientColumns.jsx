import { DataTableColumnHeader } from '../components/data-table-column-header'
import { Badge } from '../../ui/badge'

import { TableRowActions } from '../components/data-table-row-actions'

const nameSort = (rowA, rowB) => {
	const valueA = `${rowA.original.firstName} ${rowA.original.lastName}`
	const valueB = `${rowB.original.firstName} ${rowB.original.lastName}`
	return valueA.localeCompare(valueB)
}

const lastTransactionSort = (rowA, rowB, columnId) => {
	const valueA = rowA.getValue(columnId)
	const valueB = rowB.getValue(columnId)

	if (valueA === 'No Transactions Yet') return -1
	if (valueB === 'No Transactions Yet') return 1

	return new Date(valueA) - new Date(valueB)
}

export const clientColumns = [
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status')
			return (
				<Badge
					variant={
						status === 'Paid'
							? 'outline-success'
							: status === 'Unpaid'
								? 'outline-destructive'
								: 'outline-blue'
					}
				>
					{status}
				</Badge>
			)
		},
		filterFn: (row, columnId, value) => {
			const cellValue = row.getValue(columnId)
			return value.includes(cellValue)
		},
	},
	{
		accessorFn: (row) => row.fullName.trim(),
		id: 'fullName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		sortingFn: nameSort,
	},
	{
		accessorKey: 'address',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Address" />
		),
	},
	{
		accessorKey: 'totalBalance',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Outstanding Balance"
			/>
		),
	},
	{
		accessorKey: 'lastTransactionDate',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Last Transaction Date"
			/>
		),
		sortingFn: lastTransactionSort,
	},
	{
		id: 'actions',
		cell: ({ row }) => <TableRowActions row={row} type="client" />,
	},
]
