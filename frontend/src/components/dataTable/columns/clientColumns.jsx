import { DataTableColumnHeader } from '../components/data-table-column-header'
import { Badge } from '../../ui/badge'

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
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Name"
				initialSort={'asc'}
			/>
		),
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
]
