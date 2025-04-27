import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer'
import { ArrowDown, ArrowUp } from 'lucide-react'

export default function BalanceDrawer({
	totalAmount,
	totalPayment,
	balance,
	clientBalance = 0,
	isUpdateMode = false,
	originalTransaction = null,
}) {
	const [open, setOpen] = useState(false)

	const numTotalAmount =
		typeof totalAmount === 'string'
			? Number.parseFloat(totalAmount)
			: totalAmount
	const numTotalPayment =
		typeof totalPayment === 'string'
			? Number.parseFloat(totalPayment)
			: totalPayment
	const numBalance =
		typeof balance === 'string' ? Number.parseFloat(balance) : balance
	const numClientBalance =
		typeof clientBalance === 'string'
			? Number.parseFloat(clientBalance)
			: clientBalance

	let netBalanceChange = 0
	let originalAmount = 0
	let originalPayment = 0
	let originalBalance = 0

	if (isUpdateMode && originalTransaction) {
		originalAmount = originalTransaction.amount || 0
		originalPayment = originalTransaction.payment || 0
		originalBalance = originalAmount - originalPayment
		netBalanceChange = numBalance - originalBalance
	}

	const isOverpayment = numTotalPayment > numTotalAmount
	const overpayment = isOverpayment ? numTotalPayment - numTotalAmount : 0

	const projectedClientBalance =
		numClientBalance + (isUpdateMode ? netBalanceChange : numBalance)
	const remainingClientBalance = numClientBalance - overpayment

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
		? getChangeIndicator(numTotalAmount, originalAmount)
		: null
	const paymentChange = isUpdateMode
		? getChangeIndicator(numTotalPayment, originalPayment)
		: null
	const balanceChange = isUpdateMode
		? getChangeIndicator(numBalance, originalBalance)
		: null

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button variant="outline" className="w-full h-14 text-base">
					View Balance Details
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<div className="mx-auto w-full max-w-sm">
					<DrawerHeader className="text-center">
						<DrawerTitle>Balance Summary</DrawerTitle>
						<DrawerDescription>
							Detailed breakdown of your transaction balance
						</DrawerDescription>
					</DrawerHeader>

					<div className="px-4 pb-4">
						<div className="space-y-4">
							{isUpdateMode && originalTransaction && (
								<div className="bg-gray-50 p-3 rounded-lg mb-4">
									<h4 className="font-semibold text-gray-800 mb-2">
										Net Change
									</h4>
									<div
										className={`flex items-center font-medium ${netBalanceChange > 0 ? 'text-destructive' : netBalanceChange < 0 ? 'text-paid' : ''}`}
									>
										{netBalanceChange !== 0 &&
											(netBalanceChange > 0 ? (
												<ArrowUp className="h-4 w-4 mr-1" />
											) : (
												<ArrowDown className="h-4 w-4 mr-1" />
											))}
										₱{Math.abs(netBalanceChange).toFixed(2)}
										<span className="text-xs text-gray-500 ml-2">
											{netBalanceChange > 0
												? '(Balance will increase)'
												: netBalanceChange < 0
													? '(Balance will decrease)'
													: '(No change)'}
										</span>
									</div>
								</div>
							)}

							<div>
								<h5 className="font-medium mb-2">
									Balance Breakdown
								</h5>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span>Amount:</span>
										<div className="flex items-center">
											<span>
												₱{numTotalAmount.toFixed(2)}
											</span>
											{isUpdateMode &&
												amountChange.icon && (
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
											<span>
												₱{numTotalPayment.toFixed(2)}
											</span>
											{isUpdateMode &&
												paymentChange.icon && (
													<span
														className={`ml-2 flex items-center text-xs ${paymentChange.color}`}
													>
														{paymentChange.icon}
													</span>
												)}
										</div>
									</div>

									<div className="flex justify-between items-center font-medium">
										<span>Balance:</span>
										<div className="flex items-center">
											<span>
												₱{numBalance.toFixed(2)}
											</span>
											{isUpdateMode &&
												balanceChange.icon && (
													<span
														className={`ml-2 flex items-center text-xs ${balanceChange.color}`}
													>
														{balanceChange.icon}
													</span>
												)}
										</div>
									</div>
								</div>
							</div>

							<div className="border-t pt-3">
								<h4 className="font-semibold mb-2">
									Client's Account Summary
								</h4>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<div className="flex items-center">
											<span>Outstanding Balance:</span>
										</div>
										<span>
											₱{numClientBalance.toFixed(2)}
										</span>
									</div>

									{isOverpayment && (
										<div className="mt-2 p-2 bg-overpayment rounded-md">
											<p className="font-medium">
												Overpayment: ₱
												{overpayment.toFixed(2)}
											</p>
											<p className="text-xs text-gray-600 mt-1">
												This payment exceeds the service
												amount. The excess will be
												applied to the client's
												outstanding balance.
											</p>
										</div>
									)}

									{isOverpayment ? (
										<div className="flex justify-between items-center font-medium">
											<span>Remaining Balance:</span>
											<span>
												₱
												{remainingClientBalance.toFixed(
													2,
												)}
											</span>
										</div>
									) : (
										<div className="flex justify-between items-center font-medium">
											<span>Projected Balance:</span>
											<span>
												₱
												{projectedClientBalance.toFixed(
													2,
												)}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
