const router = require('express').Router()
const { sequelize } = require('../utils/db')
const {
	Transaction,
	Particular,
	transactionParticular,
	Client,
} = require('../models')
const formatTransaction = require('../utils/formatTransaction')

router.get('/', async (req, res) => {
	const transactions = await Transaction.findAll({
		include: [
			{
				model: Client,
				attributes: ['id', 'fullName'],
			},
			{
				model: Particular,
				through: {
					attributes: ['units', 'unitPrice'],
				},
			},
		],
	})

	const formattedTransactions = transactions.map(formatTransaction)

	res.status(200).json(formattedTransactions)
})

router.get('/next-jo-number', async (req, res) => {
	const lastTransaction = await Transaction.findOne({
		order: [['joNumber', 'DESC']],
	})

	const nextJONumber = lastTransaction ? lastTransaction.joNumber + 1 : 1
	res.json({ nextJONumber })
})

router.get('/:id', async (req, res) => {
	const { id } = req.params

	const transaction = await Transaction.findByPk(id, {
		include: {
			model: Particular,
			through: {
				attributes: ['units', 'unitPrice'],
			},
		},
	})

	if (!transaction) {
		return res.status(404).json({ error: 'Transaction not found.' })
	}

	const formattedTransaction = formatTransaction(transaction)

	res.json({
		transaction: formattedTransaction,
	})
})

router.post('/', async (req, res) => {
	const { clientId, particulars, date, remarks } = req.body

	if (!clientId || !Array.isArray(particulars) || particulars.length === 0) {
		return res
			.status(400)
			.json({ error: 'Client ID and particulars are required.' })
	}

	const t = await sequelize.transaction()

	try {
		const client = await Client.findByPk(clientId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!client) {
			throw new Error('Client not found.')
		}

		const currentClientTotalBalance = client.totalBalance

		const isPaymentOnly = particulars.every(
			(particular) => particular.particularId === 15,
		)

		if (isPaymentOnly) {
			const totalPayment = particulars.reduce((sum, particular) => {
				return sum + parseFloat(particular.unitPrice)
			}, 0)

			console.log('Total Payment:', totalPayment)

			if (currentClientTotalBalance <= 0) {
				throw new Error(
					'Cannot create a payment-only transaction when there is no outstanding balance.',
				)
			}

			if (totalPayment > currentClientTotalBalance) {
				throw new Error(
					`Payment amount cannot exceed the current outstanding balance of ${currentClientTotalBalance}.`,
				)
			}
		}

		const lastTransaction = await Transaction.findOne({
			order: [['joNumber', 'DESC']],
			lock: t.LOCK.UPDATE,
			transaction: t,
		})

		const joNumber = lastTransaction ? lastTransaction.joNumber + 1 : 1

		const newTransaction = await Transaction.create(
			{
				clientId,
				joNumber,
				date: date || new Date(),
				remarks: remarks || null,
			},
			{ transaction: t },
		)

		await Promise.all(
			particulars.map(async (particular) => {
				const { particularId, units = 0, unitPrice } = particular

				const existingParticular = await Particular.findByPk(
					particularId,
					{
						transaction: t,
					},
				)
				if (!existingParticular) {
					throw new Error(
						`Particular with ID ${particularId} not found.`,
					)
				}

				return transactionParticular.create(
					{
						transactionId: newTransaction.id,
						particularId,
						units,
						unitPrice,
					},
					{ transaction: t },
				)
			}),
		)

		const allTransactions = await Transaction.findAll({
			where: { clientId },
			include: {
				model: Particular,
				through: { attributes: ['units', 'unitPrice'] },
			},
			transaction: t,
		})

		let grossBalance = 0
		let totalPayments = 0
		let lastTransactionDate = null

		allTransactions.forEach((transaction) => {
			let transactionAmount = 0
			let transactionPayments = 0

			transaction.particulars.forEach((particular) => {
				const { units, unitPrice } = particular.transactionParticular
				if (particular.type === 'Payment') {
					transactionPayments += parseFloat(unitPrice) || 0
				} else {
					transactionAmount += units * unitPrice
				}
			})

			grossBalance += transactionAmount
			totalPayments += transactionPayments

			if (
				!lastTransactionDate ||
				new Date(transaction.date) > new Date(lastTransactionDate)
			) {
				lastTransactionDate = transaction.date
			}
		})

		const totalBalance = Math.max(grossBalance - totalPayments, 0)

		const status =
			totalBalance === 0
				? allTransactions.length > 0
					? 'Paid'
					: 'New'
				: 'Unpaid'

		await client.update(
			{
				totalBalance,
				lastTransactionDate:
					lastTransactionDate || 'No Transactions Yet',
				status,
			},
			{ transaction: t },
		)

		const createdTransaction = await Transaction.findByPk(
			newTransaction.id,
			{
				include: [
					{
						model: Particular,
						through: {
							attributes: ['units', 'unitPrice'],
						},
					},
				],
				transaction: t,
			},
		)

		const formattedTransaction = formatTransaction(createdTransaction)

		await t.commit()

		res.status(201).json({
			message: 'Transaction created successfully.',
			transaction: formattedTransaction,
			client: {
				fullName: client.fullName,
				totalBalance,
				status,
			},
		})
	} catch (error) {
		await t.rollback()
		res.status(500).json({ error: error.message })
	}
})

router.delete('/:id', async (req, res) => {
	const { id } = req.params

	const t = await sequelize.transaction()

	try {
		const transaction = await Transaction.findByPk(id, {
			include: {
				model: Particular,
				through: { attributes: ['units', 'unitPrice'] },
			},
			transaction: t,
		})

		if (!transaction) {
			throw new Error('Transaction not found.')
		}

		const client = await Client.findByPk(transaction.clientId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!client) {
			throw new Error('Client not found.')
		}

		let transactionAmount = 0
		let transactionPayments = 0

		transaction.particulars.forEach((particular) => {
			const { units, unitPrice } = particular.transactionParticular
			if (particular.type === 'Payment') {
				transactionPayments += parseFloat(unitPrice) || 0
			} else {
				transactionAmount += units * unitPrice
			}
		})

		await transaction.destroy({ transaction: t })

		const allTransactions = await Transaction.findAll({
			where: { clientId: client.id },
			include: {
				model: Particular,
				through: { attributes: ['units', 'unitPrice'] },
			},
			transaction: t,
		})

		let grossBalance = 0
		let totalPayments = 0
		let lastTransactionDate = null

		allTransactions.forEach((txn) => {
			let txnAmount = 0
			let txnPayments = 0

			txn.particulars.forEach((particular) => {
				const { units, unitPrice } = particular.transactionParticular
				if (particular.type === 'Payment') {
					txnPayments += parseFloat(unitPrice) || 0
				} else {
					txnAmount += units * unitPrice
				}
			})

			grossBalance += txnAmount
			totalPayments += txnPayments

			if (
				!lastTransactionDate ||
				new Date(txn.date) > new Date(lastTransactionDate)
			) {
				lastTransactionDate = txn.date
			}
		})

		const totalBalance = Math.max(grossBalance - totalPayments, 0)

		const status =
			totalBalance === 0
				? allTransactions.length > 0
					? 'Paid'
					: 'New'
				: 'Unpaid'

		await client.update(
			{
				totalBalance,
				lastTransactionDate:
					lastTransactionDate || 'No Transactions Yet',
				status,
			},
			{ transaction: t },
		)

		await t.commit()

		res.json({
			message: 'Transaction deleted and client balance updated.',
			client: {
				totalBalance,
				status,
			},
		})
	} catch (error) {
		await t.rollback()
		res.status(500).json({ error: error.message })
	}
})

router.put('/:id', async (req, res) => {
	const { id } = req.params
	const { clientId, particulars, date, remarks } = req.body

	if (!clientId || !Array.isArray(particulars) || particulars.length === 0) {
		return res
			.status(400)
			.json({ error: 'Client ID and particulars are required.' })
	}

	const t = await sequelize.transaction()

	try {
		const transaction = await Transaction.findByPk(id, {
			include: {
				model: Particular,
				through: { attributes: ['units', 'unitPrice'] },
			},
			transaction: t,
		})

		if (!transaction) {
			throw new Error('Transaction not found.')
		}

		const client = await Client.findByPk(clientId, {
			transaction: t,
			lock: t.LOCK.UPDATE,
		})

		if (!client) {
			throw new Error('Client not found.')
		}

		await transaction.update(
			{
				date: date || new Date(),
				remarks: remarks || null,
			},
			{ transaction: t },
		)

		await transactionParticular.destroy({
			where: { transactionId: id },
			transaction: t,
		})

		await Promise.all(
			particulars.map(async (particular) => {
				const { particularId, units = 0, unitPrice } = particular

				const existingParticular = await Particular.findByPk(
					particularId,
					{
						transaction: t,
					},
				)
				if (!existingParticular) {
					throw new Error(
						`Particular with ID ${particularId} not found.`,
					)
				}

				return transactionParticular.create(
					{
						transactionId: id,
						particularId,
						units,
						unitPrice,
					},
					{ transaction: t },
				)
			}),
		)

		const allTransactions = await Transaction.findAll({
			where: { clientId },
			include: {
				model: Particular,
				through: { attributes: ['units', 'unitPrice'] },
			},
			transaction: t,
		})

		let grossBalance = 0
		let totalPayments = 0
		let lastTransactionDate = null

		allTransactions.forEach((txn) => {
			let transactionAmount = 0
			let transactionPayments = 0

			txn.particulars.forEach((particular) => {
				const { units, unitPrice } = particular.transactionParticular
				if (particular.type === 'Payment') {
					transactionPayments += parseFloat(unitPrice) || 0
				} else {
					transactionAmount += units * unitPrice
				}
			})

			grossBalance += transactionAmount
			totalPayments += transactionPayments

			if (
				!lastTransactionDate ||
				new Date(txn.date) > new Date(lastTransactionDate)
			) {
				lastTransactionDate = txn.date
			}
		})

		const totalBalance = Math.max(grossBalance - totalPayments, 0)

		const status =
			totalBalance === 0
				? allTransactions.length > 0
					? 'Paid'
					: 'New'
				: 'Unpaid'

		await client.update(
			{
				totalBalance,
				lastTransactionDate:
					lastTransactionDate || 'No Transactions Yet',
				status,
			},
			{ transaction: t },
		)

		const updatedTransaction = await Transaction.findByPk(id, {
			include: [
				{
					model: Particular,
					through: {
						attributes: ['units', 'unitPrice'],
					},
				},
			],
			transaction: t,
		})

		const formattedTransaction = formatTransaction(updatedTransaction)

		await t.commit()

		res.status(200).json({
			message: 'Transaction updated successfully.',
			transaction: formattedTransaction,
			client: {
				fullName: client.fullName,
				totalBalance,
				status,
			},
		})
	} catch (error) {
		await t.rollback()
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
