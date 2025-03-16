import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from './ui/extensions/spinner'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { createTransaction, refreshClientList } from '../reducers/clientSlice'

const TRANSACTION_STORAGE_KEY = 'pending_transaction_data'
const TRANSACTION_SUBMITTED_KEY = 'transaction_submitted'

const TransactionReview = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const currentPath = location.pathname
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const [transaction, setTransaction] = useState(null)
	const clientTransactionsPath = currentPath.replace(
		'/transaction/review',
		'',
	)

	useEffect(() => {
		const wasSubmitted =
			sessionStorage.getItem(TRANSACTION_SUBMITTED_KEY) === 'true'
		if (wasSubmitted) {
			setIsSubmitted(true)
		}
	}, [])

	useEffect(() => {
		const handlePopState = (event) => {
			if (isSubmitted) {
				navigate(clientTransactionsPath, { replace: true })
			}
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [isSubmitted, navigate, clientTransactionsPath])

	useEffect(() => {
		if (location.state) {
			setTransaction(location.state)
			sessionStorage.setItem(
				TRANSACTION_STORAGE_KEY,
				JSON.stringify(location.state),
			)
		} else {
			const savedTransaction = sessionStorage.getItem(
				TRANSACTION_STORAGE_KEY,
			)
			if (savedTransaction) {
				setTransaction(JSON.parse(savedTransaction))
			}
		}
	}, [location.state])

	useEffect(() => {
		if (isSubmitted) {
			sessionStorage.setItem(TRANSACTION_SUBMITTED_KEY, 'true')
			sessionStorage.removeItem(TRANSACTION_STORAGE_KEY)

			navigate(currentPath, { replace: true })
		}
	}, [isSubmitted, navigate, currentPath])

	if (!transaction) {
		return (
			<div>
				No transaction data available. Please fill out the form first.
			</div>
		)
	}

	const handleEdit = () => {
		const newPath = currentPath.replace('/review', '/add')
		navigate(newPath, { state: transaction })
	}

	const isOverpayment = transaction.totalPayment > transaction.totalAmount
	const overpayment = isOverpayment
		? transaction.totalPayment - transaction.totalAmount
		: 0
	const remainingClientBalance = transaction.clientTotalBalance - overpayment

	const onSubmit = async () => {
		try {
			setIsLoading(true)
			setError(null)
			const { clientId, date, remarks, particulars } = transaction

			const newTransaction = {
				clientId: clientId,
				date: date,
				remarks: remarks === '' ? null : remarks,
				particulars: particulars.map((p) => ({
					particularId: p.particularId,
					units: p.type === 'Service' ? Number(p.units) : null,
					unitPrice: Number(p.unitPrice),
				})),
			}

			dispatch(createTransaction(newTransaction)).unwrap()
			dispatch(refreshClientList())
			setIsSubmitted(true)
		} catch (err) {
			setError(
				err.message ||
					'An error occurred while creating the transaction.',
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleBackToClientTransactions = () => {
		sessionStorage.removeItem(TRANSACTION_SUBMITTED_KEY)
		dispatch(refreshClientList())
		navigate(clientTransactionsPath)
	}

	const renderContent = () => (
		<div className="space-y-4">
			<div>
				<strong>Job Order #:</strong> {transaction.joNumber}
			</div>
			<div>
				<strong>Date:</strong>{' '}
				{format(new Date(transaction.date), 'PPP')}
			</div>
			<div>
				<strong>Particulars:</strong>
				<ul className="list-disc pl-5 mt-2">
					{transaction.particulars.map((p, index) => (
						<li key={index} className="mb-2">
							{p.type === 'Service'
								? `${p.name}: ${p.units} x ₱${Number.parseFloat(p.unitPrice).toFixed(2)} = ₱${(p.units * p.unitPrice).toFixed(2)}`
								: `${p.name}: ₱${Number.parseFloat(p.unitPrice).toFixed(2)}`}
						</li>
					))}
				</ul>
			</div>
			<div>
				<strong>Total Amount:</strong> ₱
				{transaction.totalAmount.toFixed(2)}
			</div>
			<div>
				<strong>Total Payment:</strong> ₱
				{transaction.totalPayment.toFixed(2)}
			</div>
			<div>
				<strong>Balance:</strong> ₱{transaction.balance.toFixed(2)}
			</div>
			{transaction.remarks && (
				<div className="bg-gray-100 p-4 rounded-md">
					<strong>Remarks:</strong>
					<p className="mt-1 whitespace-pre-wrap">
						{transaction.remarks}
					</p>
				</div>
			)}
			<div
				className={`p-4 border rounded-lg ${isOverpayment ? 'bg-yellow-50' : 'bg-blue-50'}`}
			>
				<h4 className="font-semibold mb-2">Client's Account Summary</h4>
				<p>
					<strong>
						Outstanding Balance (Before This Transaction):
					</strong>{' '}
					₱{transaction.clientTotalBalance.toFixed(2)}
				</p>
				{isOverpayment ? (
					<>
						<p>
							<strong>Overpayment Amount:</strong> ₱
							{overpayment.toFixed(2)}
						</p>
						<p>
							<strong>
								Remaining Client Balance (After Applying
								Overpayment):
							</strong>{' '}
							₱{remainingClientBalance.toFixed(2)}
						</p>
					</>
				) : (
					<p>
						<strong>
							Projected Client Balance (After This Transaction):
						</strong>{' '}
						₱{transaction.projectedClientBalance.toFixed(2)}
					</p>
				)}
			</div>
		</div>
	)

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>
					{isSubmitted ? 'Transaction Summary' : 'Transaction Review'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[60vh] pr-4">
					{isLoading ? (
						<div className="h-full flex items-center justify-center">
							<Spinner size="large">
								Creating Transaction...
							</Spinner>
						</div>
					) : (
						<>
							{error && (
								<Alert className="mb-6 bg-red-50 border-red-200">
									<div className="flex items-start gap-4">
										<AlertCircle className="h-6 w-6 text-red-500 mt-1" />
										<div>
											<AlertTitle className="text-lg font-semibold text-red-800">
												Error
											</AlertTitle>
											<AlertDescription className="text-red-700">
												{error}
											</AlertDescription>
										</div>
									</div>
								</Alert>
							)}
							{isSubmitted && (
								<Alert className="mb-6 bg-emerald-50 border-emerald-200">
									<div className="flex items-start gap-4">
										<CheckCircle2 className="h-6 w-6 text-emerald-500 mt-1" />
										<div>
											<AlertTitle className="text-lg font-semibold text-emerald-800">
												Success
											</AlertTitle>
											<AlertDescription className="text-emerald-700">
												Transaction has been
												successfully created and
												recorded.
											</AlertDescription>
										</div>
									</div>
								</Alert>
							)}
							{renderContent()}
						</>
					)}
				</ScrollArea>
			</CardContent>
			<CardFooter className="flex justify-between">
				{isSubmitted ? (
					<>
						<Button
							variant="outline"
							onClick={handleBackToClientTransactions}
						>
							Back to Client's Transactions
						</Button>
						<Button onClick={() => window.print()}>
							Print Summary
						</Button>
					</>
				) : (
					<>
						<Button
							variant="outline"
							onClick={handleEdit}
							disabled={isLoading}
						>
							Edit
						</Button>
						<Button onClick={onSubmit} disabled={isLoading}>
							{isLoading
								? 'Creating...'
								: error
									? 'Retry Submission'
									: 'Confirm and Submit'}
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	)
}

export default TransactionReview
