import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/extensions/spinner'

export default function TransactionSummary() {
	const navigate = useNavigate()
	const params = useParams()
	console.log(params.transactionId)
	const location = useLocation()
	const [transaction, setTransaction] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	const { selectedClient } = useSelector((state) => state.clients)

	useEffect(() => {
		if (location.state) {
			setTransaction(location.state)
			setIsLoading(false)
		} else {
			setIsLoading(false)
		}
	}, [location.state])

	const handleBackToTransactions = () => {
		const clientSlug = params.slugName
		navigate(`/client/${clientSlug}`, { replace: true, state: null })
	}

	const handlePrint = () => {
		window.print()
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Spinner size="large">Loading transaction details...</Spinner>
			</div>
		)
	}

	if (!transaction) {
		return (
			<div className="flex flex-col items-center justify-center h-[60vh]">
				<h2 className="text-xl font-semibold mb-4">
					Transaction not found
				</h2>
				<Button onClick={handleBackToTransactions} variant="outline">
					Back to Transactions
				</Button>
			</div>
		)
	}

	return (
		<div className="w-full max-w-3xl mx-auto">
			<Card className="mb-6 print:shadow-none">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-start">
						<div>
							<CardTitle className="text-2xl font-bold">
								Job Order #{transaction?.joNumber}
							</CardTitle>
							<p className="text-muted-foreground mt-1">
								Transaction details for{' '}
								{format(
									new Date(transaction?.date),
									'MM/dd/yyyy',
								)}
							</p>
						</div>
						<div className="hidden md:block">
							<Button
								onClick={handlePrint}
								className="flex items-center gap-2 bg-action hover:bg-action-focus"
							>
								<Printer className="h-4 w-4" />
								Print Summary
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-1">
								Customer Information
							</h3>
							<p className="text-xl font-semibold">
								{selectedClient?.fullName}
							</p>
							<p className="text-muted-foreground">
								{selectedClient?.address}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-1">
								Transaction Date
							</h3>
							<p className="text-xl font-semibold">
								{format(
									new Date(transaction?.date),
									'EEEE, MMMM d, yyyy',
								)}
							</p>
						</div>
					</div>

					<Separator className="my-6" />

					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-semibold mb-3">
								Particulars:
							</h3>
							<div className="space-y-2">
								{transaction?.particulars &&
									transaction?.particulars.map(
										(item, index) => (
											<div
												key={index}
												className="flex justify-between items-start"
											>
												<div className="flex items-start">
													<span className="mr-2">
														•
													</span>
													<div>
														<span className="font-medium">
															{item.name}:
														</span>
														<div className="text-sm text-muted-foreground">
															{item.type ===
															'Service'
																? `${item.units} x ₱${Number(item.unitPrice).toFixed(2)}`
																: ''}
														</div>
													</div>
												</div>
												<div className="font-medium">
													₱
													{(item.type === 'Service'
														? Number(item.units) *
															Number(
																item.unitPrice,
															)
														: Number(item.unitPrice)
													).toFixed(2)}
												</div>
											</div>
										),
									)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">
									Total Amount:
								</h3>
								<p className="text-xl font-semibold">
									₱{Number(transaction?.amount).toFixed(2)}
								</p>
							</div>
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">
									Total Payment:
								</h3>
								<p className="text-xl font-semibold">
									₱{Number(transaction?.payment).toFixed(2)}
								</p>
							</div>
							<div>
								<h3 className="text-sm font-medium text-muted-foreground">
									Balance:
								</h3>
								<p className="text-xl font-semibold">
									₱{Number(transaction?.balance).toFixed(2)}
								</p>
							</div>
						</div>

						{transaction?.remarks &&
							transaction?.remarks !== 'No remarks' && (
								<div className="bg-muted/50 p-4 rounded-md">
									<h3 className="font-medium mb-1">
										Remarks:
									</h3>
									<p className="whitespace-pre-wrap">
										{transaction?.remarks}
									</p>
								</div>
							)}
					</div>

					<div className="mt-6 text-sm text-muted-foreground">
						<p>Thank you for your business!</p>
						<p>
							Generated on{' '}
							{format(new Date(), 'MM/dd/yyyy, h:mm:ss a')}
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
				<Button
					onClick={handlePrint}
					className="w-full h-12 flex items-center justify-center gap-2 bg-action hover:bg-action-focus text-white"
				>
					<Printer className="h-4 w-4" />
					Print Transaction Summary
				</Button>
			</div>

			<div className="h-20 md:hidden"></div>
		</div>
	)
}
