import { useState } from 'react'
import { Button } from '../ui/button'
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

	let netBalanceChange = balance

	if (isUpdateMode && originalTransaction) {
		const originalAmount = originalTransaction.amount || 0
		const originalPayment = originalTransaction.payment || 0
		const originalBalance = originalAmount - originalPayment
		netBalanceChange = balance - originalBalance
	}

	const remainingClientBalance =
		(selectedClient?.totalBalance || 0) - overpayment

	const projectedClientBalance =
		(selectedClient?.totalBalance || 0) +
		(isUpdateMode ? netBalanceChange : balance)

	if (!shouldShow) return null

	const handleClick = (e) => {
		e.preventDefault()
		setExpanded(!expanded)
	}

	return (
		<div className="mt-2 space-y-2 text-sm">
			<div
				className={`p-4 border rounded-lg ${isOverpayment ? 'bg-yellow-50' : 'bg-blue-50'}`}
			>
				<div className="flex justify-between items-center mb-2">
					<h4 className="font-semibold">Balance Summary</h4>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClick}
						className="text-xs"
					>
						{expanded ? 'Hide Details' : 'Show Details'}
					</Button>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex justify-between">
						<span>Current Transaction Balance:</span>
						<span className="font-medium">
							₱{balance.toFixed(2)}
						</span>
					</div>

					{isUpdateMode && (
						<div className="flex justify-between">
							<span>Net Change:</span>
							<span
								className={`font-medium flex items-center ${
									netBalanceChange > 0
										? 'text-red-600'
										: netBalanceChange < 0
											? 'text-green-600'
											: ''
								}`}
							>
								{netBalanceChange > 0
									? '↑'
									: netBalanceChange < 0
										? '↓'
										: ''}
								₱{Math.abs(netBalanceChange).toFixed(2)}
							</span>
						</div>
					)}

					<div className="flex justify-between mt-1">
						<span>
							Outstanding Balance (
							{isUpdateMode
								? 'Before Update'
								: 'Before Transaction'}
							):
						</span>
						<span>₱{selectedClient?.totalBalance.toFixed(2)}</span>
					</div>

					<div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-medium">
						<span>
							Projected Balance (
							{isUpdateMode
								? 'After Update'
								: 'After Transaction'}
							):
						</span>
						<span>₱{projectedClientBalance.toFixed(2)}</span>
					</div>
				</div>

				{expanded && (
					<>
						<div className="border-t border-gray-300 my-3"></div>

						<div className="space-y-2">
							<h5 className="font-medium">Balance Breakdown</h5>
							<div>
								<p>
									<strong>Current Transaction Amount:</strong>{' '}
									₱{totalAmount.toFixed(2)}
								</p>
								<p>
									<strong>Payment Amount:</strong> ₱
									{totalPayment.toFixed(2)}
								</p>
								<p>
									<strong>
										Current Transaction Balance:
									</strong>{' '}
									₱{balance.toFixed(2)}
								</p>

								{isUpdateMode && originalTransaction && (
									<div className="border-t border-gray-300 my-2 pt-2">
										<h4 className="font-semibold text-gray-700 mb-1">
											Original Transaction
										</h4>
										<p>
											<strong>Original Amount:</strong> ₱
											{originalTransaction.amount.toFixed(
												2,
											)}
										</p>
										<p>
											<strong>Original Payment:</strong> ₱
											{originalTransaction.payment.toFixed(
												2,
											)}
										</p>
										<p>
											<strong>Original Balance:</strong> ₱
											{(
												originalTransaction.amount -
												originalTransaction.payment
											).toFixed(2)}
										</p>
										<p className="mt-1 font-medium">
											<strong>Net Change:</strong> ₱
											{netBalanceChange.toFixed(2)}
											<span className="text-xs text-gray-500 ml-2">
												{netBalanceChange > 0
													? '(Balance will increase)'
													: netBalanceChange < 0
														? '(Balance will decrease)'
														: '(No change)'}
											</span>
										</p>
									</div>
								)}

								<div className="border-t border-gray-300 my-2 pt-2">
									<h4 className="font-semibold text-black mb-2">
										Client's Account Summary
									</h4>
									<p className="text-gray-600">
										<strong>
											Outstanding Balance (
											{isUpdateMode
												? 'Excluding This Update'
												: 'Before This Transaction'}
											):
										</strong>{' '}
										₱
										{selectedClient?.totalBalance.toFixed(
											2,
										)}
									</p>
									<p className="text-xs text-gray-500">
										{isUpdateMode
											? 'This balance already includes the effects of other transactions but excludes the effects of the transaction being updated.'
											: 'This balance does not include the current transaction.'}
									</p>

									{isOverpayment && (
										<>
											<p className="mt-2">
												<strong>
													Overpayment Amount:
												</strong>{' '}
												₱{overpayment.toFixed(2)}
											</p>
											<p>
												<strong>
													Remaining Client Balance
													(After Applying
													Overpayment):
												</strong>{' '}
												₱
												{remainingClientBalance.toFixed(
													2,
												)}
											</p>
										</>
									)}

									{!isOverpayment && (
										<>
											<p className="text-black mt-2">
												<strong>
													Projected Client Balance
													(After{' '}
													{isUpdateMode
														? 'Update'
														: 'This Transaction'}
													):
												</strong>{' '}
												₱
												{projectedClientBalance.toFixed(
													2,
												)}
											</p>
											<p className="text-xs text-gray-500">
												{isUpdateMode
													? 'This is the expected outstanding balance after updating this transaction.'
													: 'This is the expected outstanding balance after adding this transaction.'}
											</p>
										</>
									)}
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default BalanceInfo
