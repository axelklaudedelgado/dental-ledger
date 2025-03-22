import { DataTableColumnHeader } from '../components/data-table-column-header'
import { TableRowActions } from '../components/data-table-row-actions'

const formatCurrency = (amount) => {
	if (!amount && amount !== 0) return ''
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
	}).format(amount)
}

export const transactionColumns = [
	{
		accessorKey: 'joNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Job Order #" />
		),
		sortDescFirst: false,
	},
	{
		accessorKey: 'date',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Date" />
		),
		sortDescFirst: false,
	},
	{
		accessorKey: 'particulars',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Particulars" />
		),
		cell: ({ row }) => (
			<div className="space-y-1">
				{row.original.formattedParticulars.map((particular, index) => (
					<div key={index} className="min-h-6">
						{particular}
					</div>
				))}
			</div>
		),
		sortDescFirst: false,
	},
	{
		accessorKey: 'unitPrices',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Unit Price" />
		),
		cell: ({ row }) => {
			const particulars = row.original.formattedParticulars
			const unitPrices = row.original.unitPrices || []

			return (
				<div className="space-y-1">
					{particulars.map((particular, index) => (
						<div key={index} className="min-h-6">
							{particular.toLowerCase() !== 'payment'
								? formatCurrency(unitPrices[index])
								: ''}
						</div>
					))}
				</div>
			)
		},
		sortDescFirst: false,
	},
	{
		accessorKey: 'amount',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Amount" />
		),
		cell: ({ row }) => (
			<div className="min-h-6">{formatCurrency(row.original.amount)}</div>
		),
		sortDescFirst: false,
	},
	{
		accessorKey: 'payment',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Payment" />
		),
		cell: ({ row }) => {
			const particulars = row.original.formattedParticulars
			const paymentIndex = particulars.findIndex(
				(p) => p.toLowerCase() === 'payment',
			)

			return (
				<div className="space-y-1">
					{particulars.map((_, index) => (
						<div key={index} className="min-h-6">
							{index === paymentIndex
								? formatCurrency(row.original.payment)
								: ''}
						</div>
					))}
				</div>
			)
		},
		sortDescFirst: false,
	},
	{
		accessorKey: 'balance',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Balance" />
		),
		cell: ({ row }) => (
			<div>
				{new Intl.NumberFormat('en-PH', {
					style: 'currency',
					currency: 'PHP',
				}).format(row.original.balance)}
			</div>
		),
		sortDescFirst: false,
	},
	{
		accessorKey: 'remarks',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Remarks" />
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => <TableRowActions row={row} type="transaction" />,
	},
]
