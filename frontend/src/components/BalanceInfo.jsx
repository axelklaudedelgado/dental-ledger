const BalanceInfo = ({
	totalAmount,
	totalPayment,
	balance,
	selectedClient,
}) => {
	const shouldShow = totalAmount > 0 || totalPayment > 0
	const isOverpayment = totalPayment > totalAmount
	const overpayment = isOverpayment ? totalPayment - totalAmount : 0
	const remainingClientBalance =
		(selectedClient?.totalBalance || 0) - overpayment
	const projectedClientBalance = (selectedClient?.totalBalance || 0) + balance

	if (!shouldShow) return null

	return (
		<div className="mt-2 space-y-2 text-sm">
			<div
				className={`p-4 border rounded-lg ${isOverpayment ? 'bg-yellow-50' : 'bg-blue-50'}`}
			>
				<h4 className="font-semibold mb-2">Balance Breakdown</h4>
				<div className="space-y-1">
					<p>
						<strong>Current Transaction Amount:</strong> ₱
						{totalAmount.toFixed(2)}
					</p>
					<p>
						<strong>Payment Amount:</strong> ₱
						{totalPayment.toFixed(2)}
					</p>
					<p>
						<strong>Current Transaction Balance:</strong> ₱
						{balance.toFixed(2)}
					</p>

					<div className="border-t border-gray-300 my-2 pt-2">
						<h4 className="font-semibold text-black mb-2">
							Client's Account Summary
						</h4>
						<p className="text-gray-600">
							<strong>
								Outstanding Balance (Before This Transaction):
							</strong>{' '}
							₱{selectedClient?.totalBalance.toFixed(2)}
						</p>
						<p className="text-xs text-gray-500">
							This balance does not include the current
							transaction.
						</p>

						{isOverpayment && (
							<>
								<p className="mt-2">
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
						)}

						{!isOverpayment && balance > 0 && (
							<>
								<p className="text-black mt-2">
									<strong>
										Projected Client Balance (After This
										Transaction):
									</strong>{' '}
									₱{projectedClientBalance.toFixed(2)}
								</p>
								<p className="text-xs text-gray-500">
									This is the expected outstanding balance
									after adding this transaction.
								</p>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default BalanceInfo
