import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import { MoreHorizontal } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

export function TableRowActions({ row, type }) {
	const navigate = useNavigate()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				onClick={(event) => event.stopPropagation()}
			>
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem
					onSelect={() => navigate(`/${type}/${row.original.id}`)}
				>
					View {type} details
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => console.log('update')}>
					Update
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => console.log('delete')}>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
