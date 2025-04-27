import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react'

const BalanceInfo = ({
	totalAmount,
	totalPayment,
	balance,
	selectedClient,
	isUpdateMode = false,
	originalTransaction = null,
}) => {
	const [expanded, setExpanded] = useState(false)
	const shouldShow = totalAmount > 0 || totalPayment > 0
	const isOverpayment = totalPayment > totalAmount
	const overpayment = isOverpayment ? totalPayment - totalAmount : 0

	let netBalanceChange = 0
	let originalAmount = 0
	let originalPayment = 0
	let originalBalance = 0

	if (isUpdateMode && originalTransaction) {
		originalAmount = originalTransaction.amount || 0
		originalPayment = originalTransaction.payment || 0
		originalBalance = originalAmount - originalPayment
		netBalanceChange = balance - originalBalance
	}

	const projectedClientBalance =
		(selectedClient?.totalBalance || 0) +
		(isUpdateMode ? netBalanceChange : balance)

	if (!shouldShow) return null

	const handleClick = (e) => {
		e.preventDefault()
		setExpanded(!expanded)
	}

	const getChangeIndicator = (current, original) => {
		if (current === original)
			return { text: 'No change', icon: null, color: 'text-gray-500' }
		if (current > original)
			return {
				text: 'Increased',
				icon: <ArrowUp className="h-4 w-4" />,
				color: 'text-destructive',
			}
		return {
			text: 'Decreased',
			icon: <ArrowDown className="h-4 w-4" />,
			color: 'text-paid',
		}
	}

	const amountChange = isUpdateMode
		? getChangeIndicator(totalAmount, originalAmount)
		: null
	const paymentChange = isUpdateMode
		? getChangeIndicator(totalPayment, originalPayment)
		: null

	return (
		<div className="mt-2 space-y-2 text-sm">
			<div
				className={`p-4 border rounded-lg ${isOverpayment ? 'bg-partial-background' : 'bg-secondary-background'}`}
			>
				<div className="flex justify-between items-center mb-2">
					<h4 className="font-semibold">Balance Summary</h4>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClick}
						className="text-xs flex items-center"
					>
						{expanded ? (
							<>
								Hide Details{' '}
								<ChevronUp className="ml-1 h-3 w-3" />
							</>
						) : (
							<>
								Show Details{' '}
								<ChevronDown className="ml-1 h-3 w-3" />
							</>
						)}
					</Button>
				</div>

				{isUpdateMode && originalTransaction && (
					<div className="flex justify-between items-center mb-2">
						<span className="font-medium">Net Change:</span>
						<span
							className={`font-medium flex items-center ${
								netBalanceChange > 0
									? 'text-destructive'
									: netBalanceChange < 0
										? 'text-paid'
										: ''
							}`}
						>
							{netBalanceChange !== 0 &&
								(netBalanceChange > 0 ? (
									<ArrowUp className="mr-1 h-4 w-4" />
								) : (
									<ArrowDown className="mr-1 h-4 w-4" />
								))}
							₱{Math.abs(netBalanceChange).toFixed(2)}
						</span>
					</div>
				)}

				<div className="flex flex-col gap-1">
					<div className="flex justify-between">
						<span>Current Balance:</span>
						<span className="font-medium">
							₱{balance.toFixed(2)}
						</span>
					</div>

					<div className="flex justify-between mt-1">
						<span>Outstanding Balance:</span>
						<span>₱{selectedClient?.totalBalance.toFixed(2)}</span>
					</div>

					<div className="flex justify-between border-t border-gray-300 pt-2 mt-1 font-medium">
						<span>Projected Balance:</span>
						<span>₱{projectedClientBalance.toFixed(2)}</span>
					</div>
				</div>

				{expanded && (
					<>
						<div className="border-t border-gray-400 my-3"></div>

						<div className="space-y-3">
							<h5 className="font-medium">Detailed Breakdown</h5>

							<div className="space-y-1">
								<div className="flex justify-between items-center">
									<span>Amount:</span>
									<div className="flex items-center">
										<span>₱{totalAmount.toFixed(2)}</span>
										{isUpdateMode && amountChange.icon && (
											<span
												className={`ml-2 flex items-center text-xs ${amountChange.color}`}
											>
												{amountChange.icon}
											</span>
										)}
									</div>
								</div>

								<div className="flex justify-between items-center">
									<span>Payment:</span>
									<div className="flex items-center">
										<span>₱{totalPayment.toFixed(2)}</span>
										{isUpdateMode && paymentChange.icon && (
											<span
												className={`ml-2 flex items-center text-xs ${paymentChange.color}`}
											>
												{paymentChange.icon}
											</span>
										)}
									</div>
								</div>
							</div>

							{isOverpayment && (
								<div className="mt-2 p-2 bg-overpayment border-l-4 border-yellow-500 rounded-md">
									<p className="font-medium">
										Overpayment: ₱{overpayment.toFixed(2)}
									</p>
									<p className="text-xs text-gray-600 mt-1">
										This payment exceeds the service amount.
										The excess will be applied to the
										client's outstanding balance.
									</p>
								</div>
							)}

							{isUpdateMode && originalTransaction && (
								<div className="mt-2 p-2 bg-gray-100 rounded-md">
									<p className="font-medium mb-1">
										Original Transaction
									</p>
									<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
										<span>Amount:</span>
										<span>
											₱{originalAmount.toFixed(2)}
										</span>
										<span>Payment:</span>
										<span>
											₱{originalPayment.toFixed(2)}
										</span>
										<span>Balance:</span>
										<span>
											₱{originalBalance.toFixed(2)}
										</span>
									</div>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default BalanceInfo
