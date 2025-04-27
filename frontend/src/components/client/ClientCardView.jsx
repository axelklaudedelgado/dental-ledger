import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '../ui/extensions/spinner'
import { Filter, Edit, Search, Trash2, Eye } from 'lucide-react'
import { ClientForm } from './ClientForm'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { useDispatch } from 'react-redux'
import { deleteClient } from '../../reducers/clientSlice'
import { useToast } from '../ui/hooks/use-toast'

const removeTitles = (name) => {
	if (!name) return ''
	return name
		.replace(/^Dr\.\s+/i, '')
		.replace(/^Dra\.\s+/i, '')
		.trim()
}

export const ClientsCardView = ({ data, status, error, onDeleteClient }) => {
	const navigate = useNavigate()
	const [searchTerm, setSearchTerm] = useState('')
	const [displayCount, setDisplayCount] = useState(10)
	const [statusFilters, setStatusFilters] = useState([])
	const [addClientOpen, setAddClientOpen] = useState(false)
	const [highlightedClientId, setHighlightedClientId] = useState(null)
	const [clientToEdit, setClientToEdit] = useState(null)
	const [isEditFormOpen, setIsEditFormOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [clientToDelete, setClientToDelete] = useState(null)
	const loaderRef = useRef(null)
	const { toast } = useToast()
	const dispatch = useDispatch()

	// Function to truncate text with ellipsis
	const truncateText = (text, lines = 2) => {
		return {
			overflow: 'hidden',
			display: '-webkit-box',
			WebkitLineClamp: lines,
			WebkitBoxOrient: 'vertical',
		}
	}

	const uniqueStatuses = [
		...new Set(data.map((client) => client.status).filter(Boolean)),
	]

	const filteredClients = data.filter((client) => {
		const matchesSearch =
			client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.address?.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesStatus =
			statusFilters.length === 0 ||
			(client.status &&
				statusFilters.includes(client.status.toLowerCase()))

		return matchesSearch && matchesStatus
	})

	const highlightedClient = data.find(
		(client) => client.id === highlightedClientId,
	)

	const sortedClients = [...filteredClients]
		.filter((client) => client.id !== highlightedClientId)
		.sort((a, b) => {
			const nameA = removeTitles(a.fullName).toLowerCase()
			const nameB = removeTitles(b.fullName).toLowerCase()
			return nameA.localeCompare(nameB)
		})

	const clientsToDisplay = sortedClients.slice(0, displayCount)

	useEffect(() => {
		if (highlightedClientId) {
			const timeout = setTimeout(() => {
				setHighlightedClientId(null)
			}, 3000)
			return () => clearTimeout(timeout)
		}
	}, [highlightedClientId])

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					clientsToDisplay.length < sortedClients.length
				) {
					setDisplayCount((prevCount) => prevCount + 10)
				}
			},
			{ threshold: 0.1 },
		)

		if (loaderRef.current) {
			observer.observe(loaderRef.current)
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current)
			}
		}
	}, [clientsToDisplay.length, sortedClients.length])

	const toggleStatusFilter = (status) => {
		setStatusFilters((prev) =>
			prev.includes(status)
				? prev.filter((s) => s !== status)
				: [...prev, status],
		)
	}

	const openDeleteDialog = (client) => {
		setClientToDelete(client)
		setDeleteDialogOpen(true)
	}

	const handleDeleteClient = async () => {
		if (!clientToDelete) return

		try {
			await dispatch(deleteClient(clientToDelete.id)).unwrap()
			toast({
				variant: 'destructive',
				title: 'Client Deleted',
				description: `The client ${clientToDelete.fullName} has been successfully deleted.`,
			})
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to delete client: ${error.message || 'Unknown error'}`,
			})
		} finally {
			setDeleteDialogOpen(false)
			setClientToDelete(null)
		}
	}

	const handleEditClient = (client) => {
		setClientToEdit(client)
		setIsEditFormOpen(true)
	}

	const handleClientAdded = (newClientId) => {
		setHighlightedClientId(newClientId)
	}

	const renderClientCard = (client, isHighlighted = false) => (
		<div key={client.id} className="relative">
			<Card
				className={`overflow-hidden hover:shadow-md transition-shadow ${
					isHighlighted ? 'bg-yellow-50 border-partial' : ''
				}`}
			>
				<CardContent
					className={`p-0 ${isHighlighted ? 'animate-pulse' : ''}`}
				>
					{client.status && (
						<div className="w-full">
							<div
								className={`px-4 py-2 text-sm font-medium ${
									client.status.toLowerCase() === 'unpaid'
										? 'text-destructive bg-destructive-background'
										: client.status.toLowerCase() === 'paid'
											? 'text-paid bg-paid-background'
											: 'text-secondary bg-secondary-background'
								}`}
							>
								{client.status.charAt(0).toUpperCase() +
									client.status.slice(1)}
							</div>
						</div>
					)}

					<div className="p-4">
						<h3 className="font-medium text-lg mb-3">
							{client.fullName}
						</h3>
						<div className="grid gap-3">
							{client.address && (
								<div>
									<p className="text-xs text-zinc-400">
										Address
									</p>
									<p
										className="text-sm"
										style={truncateText(client.address, 2)}
									>
										{client.address}
									</p>
								</div>
							)}
							{client.totalBalance !== undefined && (
								<div>
									<p className="text-xs text-zinc-400">
										Outstanding Balance
									</p>
									<p className="text-lg font-semibold">
										{new Intl.NumberFormat('en-PH', {
											style: 'currency',
											currency: 'PHP',
										}).format(client.totalBalance)}
									</p>
								</div>
							)}
							{client.lastTransactionDate && (
								<div>
									<p className="text-xs text-zinc-400">
										Last Transaction Date
									</p>
									<p
										className={`text-sm ${client.lastTransactionDate === 'No Transactions Yet' ? 'italic text-zinc-500' : ''}`}
									>
										{client.lastTransactionDate ===
										'No Transactions Yet'
											? client.lastTransactionDate
											: new Date(
													client.lastTransactionDate,
												).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="px-2 py-2 bg-muted/20 border-t flex justify-between">
						<Button
							variant="ghost"
							size="sm"
							className="flex-1 h-12"
							onClick={(e) => {
								e.stopPropagation()
								navigate(`/client/${client.slugName}`)
							}}
						>
							<Eye className="h-4 w-4 mr-2" />
							View
						</Button>
						<div className="w-px h-8 bg-border self-center" />
						<Button
							variant="ghost"
							size="sm"
							className="flex-1 h-12"
							onClick={(e) => {
								e.stopPropagation()
								handleEditClient(client)
							}}
						>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Button>
						<div className="w-px h-8 bg-border self-center" />
						<Button
							variant="ghost"
							size="sm"
							className="flex-1 h-12 text-destructive hover:text-destructive hover:bg-destructive-background"
							onClick={(e) => {
								e.stopPropagation()
								openDeleteDialog(client)
							}}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)

	if (status === 'loading') {
		return (
			<div className="flex justify-center p-8">
				<Spinner size="large">Loading clients...</Spinner>
			</div>
		)
	}

	if (status === 'failed') {
		return (
			<div className="text-center p-8 text-destructive">
				Failed to load clients data: {error}
			</div>
		)
	}

	return (
		<div className="pb-20">
			<div className="sticky top-0 z-10 bg-background py-3 border-b">
				<div className="flex items-center gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search clients..."
							className="pl-9 w-full h-11"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<Drawer>
						<DrawerTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="flex-shrink-0 h-11 w-11"
							>
								<Filter className="h-5 w-5" />
							</Button>
						</DrawerTrigger>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Filter Clients</DrawerTitle>
							</DrawerHeader>
							<div className="px-4 py-2">
								<div className="space-y-4">
									<div>
										<h3 className="text-sm font-medium mb-3">
											Status
										</h3>
										<div className="space-y-2">
											{uniqueStatuses.map((status) => (
												<div
													key={status}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`status-${status}`}
														checked={statusFilters.includes(
															status.toLowerCase(),
														)}
														onCheckedChange={() =>
															toggleStatusFilter(
																status.toLowerCase(),
															)
														}
													/>
													<Label
														htmlFor={`status-${status}`}
														className="capitalize"
													>
														{status}
													</Label>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
							<DrawerFooter className="pt-2">
								<Button
									variant="outline"
									onClick={() => setStatusFilters([])}
								>
									Reset Filters
								</Button>
								<DrawerClose asChild>
									<Button className="bg-action hover:bg-action-focus">
										Apply Filters
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</Drawer>

					<ClientForm
						onClientAdded={handleClientAdded}
						isMobile={true}
						open={addClientOpen}
						onOpenChange={setAddClientOpen}
					/>

					{clientToEdit && (
						<ClientForm
							initialData={clientToEdit}
							isUpdateMode={true}
							open={isEditFormOpen}
							onOpenChange={setIsEditFormOpen}
							onClientUpdated={() => {
								setClientToEdit(null)
							}}
						/>
					)}
				</div>
			</div>

			<div className="py-5">
				{filteredClients.length === 0 && !highlightedClient ? (
					<div className="text-center p-8">No clients found.</div>
				) : (
					<div className="space-y-5">
						{highlightedClient &&
							renderClientCard(highlightedClient, true)}

						{clientsToDisplay.map((client) =>
							renderClientCard(client),
						)}

						{clientsToDisplay.length < sortedClients.length && (
							<div
								ref={loaderRef}
								className="flex justify-center p-6 mt-2"
							>
								<Spinner size="small">Loading more...</Spinner>
							</div>
						)}
					</div>
				)}
			</div>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
						<AlertDialogDescription>
							You are about to delete this client:{' '}
							<strong>{clientToDelete?.fullName}</strong>
							<br />
							<br />
							This action is irreversible. Deleting this client
							will also remove all associated records.
							<br />
							<br />
							Are you sure you want to proceed?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteClient}
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
