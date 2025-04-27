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

import { ClientForm } from '../../client/ClientForm'

import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useToast } from '../../ui/hooks/use-toast'

import { deleteClient, deleteTransaction } from '@/reducers/clientSlice'

export function TableRowActions({ row, type }) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { toast } = useToast()
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [updateFormOpen, setUpdateFormOpen] = useState(false)

	// Get the current slugName from the URL
	const { slugName } = useParams()

	const handleDelete = async () => {
		const id = row.original.id

		try {
			if (type === 'client') {
				await dispatch(deleteClient(id)).unwrap()
				toast({
					variant: 'destructive',
					title: 'Client Deleted',
					description: `The client ${row.original.fullName} has been successfully deleted.`,
				})
			} else if (type === 'transaction') {
				await dispatch(deleteTransaction(id)).unwrap()
				toast({
					variant: 'destructive',
					title: 'Transaction Deleted',
					description: `Transaction #${row.original.joNumber} has been successfully deleted.`,
				})
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to delete ${type}. Please try again.`,
			})
		}
		setDeleteDialogOpen(false)
	}

	const handleViewDetails = () => {
		if (type === 'client') {
			const { slugName } = row.original
			navigate(`/${type}/${slugName}`)
		} else {
			const { id } = row.original
			navigate(`${location.pathname}/${type}/${id}`, {
				state: row.original,
			})
		}
	}

	const handleClientUpdated = () => {
		setUpdateFormOpen(false)
	}

	const handleUpdateTransaction = () => {
		if (type === 'transaction') {
			if (slugName) {
				navigate(`/client/${slugName}/transaction/edit`, {
					state: row.original,
				})
			} else {
				toast({
					variant: 'destructive',
					title: 'Error',
					description:
						'Could not determine the client. Please try again.',
				})
			}
		} else {
			setUpdateFormOpen(true)
		}
		setDropdownOpen(false)
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
					<DropdownMenuItem
						onSelect={(e) => {
							e.preventDefault()
							handleUpdateTransaction()
						}}
					>
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

			{type === 'client' && (
				<ClientForm
					initialData={row.original}
					onClientUpdated={handleClientUpdated}
					open={updateFormOpen}
					isUpdateMode={true}
					onOpenChange={setUpdateFormOpen}
				/>
			)}

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to delete this {type}:{' '}
							<strong>
								{type === 'client'
									? row.original.fullName
									: `Transaction #${row.original.joNumber}`}
							</strong>
							<br />
							<br />
							{type === 'client'
								? 'This action is irreversible. Deleting this client will also remove all associated records.'
								: "This action is irreversible. Deleting this transaction may affect the client's balance."}
							<br />
							<br />
							Are you sure you want to proceed?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive hover:bg-destructive-focus"
						>
							Confirm Deletion
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
