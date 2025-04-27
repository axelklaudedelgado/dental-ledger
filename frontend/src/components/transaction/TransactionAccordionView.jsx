import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
	Search,
	Plus,
	ChevronDown,
	ChevronRight,
	Eye,
	Pencil,
	Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Spinner } from '../ui/extensions/spinner'
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
import { deleteTransaction } from '@/reducers/clientSlice'
import { useToast } from '../ui/hooks/use-toast'

export const TransactionAccordionView = ({
	transactions = [],
	status,
	error,
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [expandedId, setExpandedId] = useState(null)
	const [displayCount, setDisplayCount] = useState(10)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [transactionToDelete, setTransactionToDelete] = useState(null)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { toast } = useToast()
	const loaderRef = useRef(null)

	const { slugName } = useParams()

	const filteredTransactions = transactions.filter((transaction) => {
		const searchTermLower = searchTerm.toLowerCase()

		const joNumberMatch = transaction.joNumber
			?.toString()
			.includes(searchTerm)

		const particularsMatch = transaction.formattedParticulars?.some(
			(particular) => particular.toLowerCase().includes(searchTermLower),
		)

		const dateMatch = transaction.date?.includes(searchTerm)

		const remarksMatch = transaction.remarks
			?.toLowerCase()
			.includes(searchTermLower)

		return joNumberMatch || particularsMatch || dateMatch || remarksMatch
	})

	const sortedTransactions = [...filteredTransactions].sort((a, b) => {
		const dateA = new Date(a.date).getTime()
		const dateB = new Date(b.date).getTime()

		if (dateA !== dateB) {
			return dateB - dateA
		}

		return b.joNumber - a.joNumber
	})

	const transactionsToDisplay = sortedTransactions.slice(0, displayCount)

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 2,
		}).format(amount)
	}

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	const getPaymentStatus = (payment, balance, transaction) => {
		if (payment === 0) return 'unpaid'
		if (balance === 0 && payment === transaction.amount) return 'fully-paid'
		if (payment > transaction.amount) return 'overpaid'
		if (balance === 0) return 'fully-paid'
		return 'partial'
	}

	const toggleExpanded = (id) => {
		setExpandedId(expandedId === id ? null : id)
	}

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					transactionsToDisplay.length < sortedTransactions.length
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
	}, [transactionsToDisplay.length, sortedTransactions.length])

	const openDeleteDialog = (transaction) => {
		setTransactionToDelete(transaction)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (transactionToDelete) {
			await dispatch(deleteTransaction(transactionToDelete.id)).unwrap()
			toast({
				variant: 'destructive',
				title: 'Transaction Deleted',
				description: `Transaction #${transactionToDelete.joNumber} has been successfully deleted.`,
			})
		}
		setDeleteDialogOpen(false)
		setTransactionToDelete(null)
	}

	if (status === 'loading') {
		return (
			<div className="flex justify-center p-8">
				<Spinner size="large">Loading transactions...</Spinner>
			</div>
		)
	}

	if (status === 'failed') {
		return (
			<div className="text-center p-8 text-destructive">
				Failed to load transactions data: {error}
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
							placeholder="Search transactions..."
							className="pl-9 w-full h-11"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						onClick={() =>
							navigate(`${location.pathname}/transaction/add`)
						}
						size="icon"
						className="h-11 w-11 bg-action hover:bg-action-focus"
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>
			</div>

			<div className="py-5">
				{filteredTransactions.length === 0 ? (
					<div className="text-center p-8 text-muted-foreground">
						No transactions found.
					</div>
				) : (
					<ul className="space-y-5">
						{transactionsToDisplay.map((transaction) => {
							const paymentStatus = getPaymentStatus(
								transaction.payment,
								transaction.balance,
								transaction,
							)
							const isExpanded =
								expandedId === transaction.joNumber
							const hasRemarks =
								transaction.remarks &&
								transaction.remarks !== 'No remarks'

							return (
								<li
									key={transaction.joNumber}
									className={cn(
										'border rounded-lg overflow-hidden transition-all duration-200 bg-white',
										isExpanded ? 'shadow-md' : 'shadow-sm',
									)}
								>
									<div
										className="flex items-center cursor-pointer"
										onClick={() =>
											toggleExpanded(transaction.joNumber)
										}
									>
										<div className="flex-1 p-5">
											<div className="flex justify-between items-center">
												<h3 className="font-medium text-base">
													Job Order #
													{transaction.joNumber}
												</h3>
												<Badge
													className="capitalize"
													variant={
														paymentStatus ===
														'fully-paid'
															? 'outline-success'
															: paymentStatus ===
																  'partial'
																? 'outline-yellow'
																: paymentStatus ===
																	  'overpaid'
																	? 'outline-blue'
																	: 'outline-destructive'
													}
												>
													{paymentStatus ===
													'fully-paid'
														? 'Fully Paid'
														: paymentStatus ===
															  'partial'
															? 'Partial'
															: paymentStatus ===
																  'overpaid'
																? 'Overpaid'
																: 'Unpaid'}
												</Badge>
											</div>
											<div className="flex justify-between items-center mt-2.5">
												<span className="text-sm text-muted-foreground">
													{formatDate(
														transaction.date,
													)}
												</span>
												<div className="text-right">
													<span className="text-xs text-muted-foreground">
														Balance
													</span>
													<span
														className={cn(
															'ml-1 font-medium',
															transaction.balance ===
																0
																? 'text-paid'
																: transaction.balance <
																	  0
																	? 'text-secondary'
																	: 'text-destructive',
														)}
													>
														{formatCurrency(
															transaction.balance,
														)}
													</span>
												</div>
											</div>
										</div>

										<div className="pr-4 pl-2">
											<div className="p-2.5 rounded-full hover:bg-muted">
												<ChevronRight
													className={cn(
														'h-6 w-6 text-muted-foreground transition-transform duration-300',
														isExpanded
															? 'rotate-90'
															: 'rotate-0',
													)}
												/>
											</div>
										</div>
									</div>

									<div
										className={cn(
											'overflow-hidden transition-all duration-300 ease-in-out',
											isExpanded
												? 'max-h-screen opacity-100'
												: 'max-h-0 opacity-0',
										)}
									>
										<div className="border-t">
											<div className="p-5 bg-muted/10">
												<div className="space-y-6">
													<div>
														<h4 className="text-sm font-medium text-muted-foreground mb-3">
															Particulars
														</h4>
														<ul className="space-y-3.5">
															{transaction.particulars?.map(
																(p, index) => (
																	<li
																		key={
																			index
																		}
																		className="text-sm"
																	>
																		<div className="flex items-start">
																			<span className="mr-2">
																				•
																			</span>
																			<span>
																				{p.type ===
																				'Service'
																					? `${p.name}: ${p.units} x ${formatCurrency(p.unitPrice)} = ${formatCurrency(p.units * p.unitPrice)}`
																					: `${p.name}: ${formatCurrency(p.unitPrice)}`}
																			</span>
																		</div>
																	</li>
																),
															)}
														</ul>
													</div>

													<div className="grid grid-cols-2 gap-6">
														<div>
															<h4 className="text-sm font-medium text-muted-foreground mb-2">
																Amount
															</h4>
															<p className="text-base">
																{formatCurrency(
																	transaction.amount,
																)}
															</p>
														</div>
														<div>
															<h4 className="text-sm font-medium text-muted-foreground mb-2">
																Payment
															</h4>
															<p className="text-base">
																{formatCurrency(
																	transaction.payment,
																)}
															</p>
														</div>
													</div>

													<div>
														<h4 className="text-sm font-medium text-muted-foreground mb-2">
															Balance
														</h4>
														<p
															className={cn(
																'text-base font-medium',
																transaction.balance ===
																	0
																	? 'text-paid'
																	: transaction.balance <
																		  0
																		? 'text-secondary'
																		: 'text-destructive',
															)}
														>
															{formatCurrency(
																transaction.balance,
															)}
														</p>
													</div>

													{hasRemarks && (
														<div className="border-t pt-5 mt-5">
															<h4 className="text-sm font-medium text-muted-foreground mb-2">
																Remarks
															</h4>
															<p className="text-sm whitespace-pre-wrap break-words">
																{
																	transaction.remarks
																}
															</p>
														</div>
													)}
												</div>
											</div>

											<div className="flex border-t p-2.5 bg-muted/10 mt-2">
												<Button
													variant="ghost"
													size="sm"
													className="flex-1 h-12 text-sm font-medium"
													onClick={(e) => {
														e.stopPropagation()
														const { id } =
															transaction
														navigate(
															`${location.pathname}/transaction/${id}`,
															{
																state: transaction,
															},
														)
													}}
												>
													<Eye className="h-5 w-5 mr-2" />
													View
												</Button>
												<div className="w-px h-8 bg-border self-center" />
												<Button
													variant="ghost"
													size="sm"
													className="flex-1 h-12 text-sm font-medium"
													onClick={(e) => {
														e.stopPropagation()
														navigate(
															`/client/${slugName}/transaction/edit`,
															{
																state: transaction,
															},
														)
													}}
												>
													<Pencil className="h-5 w-5 mr-2" />
													Edit
												</Button>
												<div className="w-px h-8 bg-border self-center" />
												<Button
													variant="ghost"
													size="sm"
													className="flex-1 h-12 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive-background"
													onClick={(e) => {
														e.stopPropagation()
														openDeleteDialog(
															transaction,
														)
													}}
												>
													<Trash2 className="h-5 w-5 mr-2" />
													Delete
												</Button>
											</div>
										</div>
									</div>
								</li>
							)
						})}

						{transactionsToDisplay.length <
							sortedTransactions.length && (
							<div
								ref={loaderRef}
								className="flex justify-center p-6 mt-2"
							>
								<Spinner size="small">Loading more...</Spinner>
							</div>
						)}
					</ul>
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
							You are about to delete Job Order #
							{transactionToDelete?.joNumber}.
							<br />
							<br />
							This action is irreversible. Are you sure you want
							to proceed?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
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
