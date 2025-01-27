import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useToast } from '../../ui/hooks/use-toast'

import clientService from '@/services/clientService'
import { deleteClient } from '@/reducers/clientSlice'

export function TableRowActions({ row, type }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { toast } = useToast()
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [dropdownOpen, setDropdownOpen] = useState(false)

	const handleDelete = async () => {
		if (type === 'clients') {
			const clientId = row.original.id
			const clientName = row.original.name

			try {
				await clientService.deleteOne(clientId)
				dispatch(deleteClient(clientId))
				toast({
					variant: 'destructive',
					title: 'Client Deleted',
					description: `The client ${clientName} has been successfully deleted.`,
				})
			} catch (error) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: `Failed to delete client ${clientName}. Please try again.`,
				})
			}
		}
		setDeleteDialogOpen(false)
	}

	const handleViewDetails = () => {
		navigate(`/${type}/${row.original.id}`)
	}

	const handleUpdate = () => {
		console.log('update')
	}

	return (
		<div onClick={(e) => e.stopPropagation()}>
			<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem onSelect={handleViewDetails}>
						View {type} details
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={handleUpdate}>
						Update
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							setDropdownOpen(false)
							setDeleteDialogOpen(true)
						}}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to delete this {type.slice(0, -1)}:{' '}
							<strong>{row.original.name}</strong>
							<br />
							<br />
							Please be aware that this action is irreversible.
							Deleting this {type.slice(0, -1)} will also remove
							all associated records.
							<br />
							<br />
							Are you sure you want to proceed with this deletion?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Confirm Deletion
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
