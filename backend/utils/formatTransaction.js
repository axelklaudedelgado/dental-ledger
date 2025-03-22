const formatTransaction = (transaction) => {
	const { joNumber, date, remarks, particulars, id } = transaction

	let totalAmount = 0
	let totalPayments = 0

	const regularItems = []
	const payments = []
	const regularUnitPrices = []

	const structuredParticulars = []

	particulars.forEach((particular) => {
		const { units, unitPrice } = particular.transactionParticular
		const isPayment = particular.type === 'Payment'

		structuredParticulars.push({
			particularId: particular.id,
			type: particular.type,
			name: particular.name,
			units: units,
			unitPrice: unitPrice,
		})

		if (isPayment) {
			totalPayments += parseFloat(unitPrice)
			payments.push('Payment')
		} else {
			totalAmount += units * unitPrice
			regularItems.push(
				`${units} ${units > 1 ? 'units' : 'unit'} ${particular.name}`,
			)
			regularUnitPrices.push(unitPrice)
		}
	})

	const formattedParticulars = [...regularItems, ...payments]
	const unitPrices = regularUnitPrices
	const balance = Math.max(totalAmount - totalPayments, 0)

	return {
		id,
		joNumber,
		date,
		particulars: structuredParticulars, 
		formattedParticulars: formattedParticulars, 
		unitPrices,
		amount: totalAmount,
		payment: totalPayments,
		balance,
		remarks: remarks || 'No remarks',
	}
}

module.exports = formatTransaction
