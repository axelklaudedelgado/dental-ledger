import { DataTableColumnHeader } from '../components/data-table-column-header'

export const transactionColumns = [
	{
		accessorKey: 'joNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Job Order #" />
		),
	},
	{
		accessorKey: 'date',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Date" />
		),
	},
	{
		accessorKey: 'particulars',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Particulars" />
		),
		cell: ({ row }) => (
			<div>
				{row.original.particulars.map((particular, index) => (
					<div key={index}>{particular}</div>
				))}
			</div>
		),
	},
	{
		accessorKey: 'unitPrices',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Unit Price" />
		),
		cell: ({ row }) => (
			<div>
				{row.original.unitPrices.map((unitPrice, index) => (
					<div key={index}>
						{new Intl.NumberFormat('en-PH', {
							style: 'currency',
							currency: 'PHP',
						}).format(unitPrice)}
					</div>
				))}
			</div>
		),
	},
	{
		accessorKey: 'amount',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Amount" />
		),
		cell: ({ row }) => (
			<div>
				{new Intl.NumberFormat('en-PH', {
					style: 'currency',
					currency: 'PHP',
				}).format(row.original.amount)}
			</div>
		),
	},
	{
		accessorKey: 'payment',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Payment" />
		),
		cell: ({ row }) => (
			<div>
				{new Intl.NumberFormat('en-PH', {
					style: 'currency',
					currency: 'PHP',
				}).format(row.original.payment)}
			</div>
		),
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
	},
	{
		accessorKey: 'remarks',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Remarks" />
		),
	},
]
