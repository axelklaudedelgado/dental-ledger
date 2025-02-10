const router = require('express').Router()
const { Op } = require('sequelize')
const { Client, Transaction, Particular } = require('../models')
const generateClientSlug = require('../utils/generateClientSlug')

router.get('/', async (req, res) => {
	const clients = await Client.findAll()
	res.json(
		clients.map((client) => ({
			...client.toJSON(),
			slugName: generateClientSlug(
				client.firstName,
				client.lastName,
				client.id,
			),
		})),
	)
})

router.get('/:id', async (req, res) => {
	const { id } = req.params

	const client = await Client.findOne({
		where: { id },
		attributes: ['id', 'title', 'firstName', 'lastName', 'address'],
		include: [
			{
				model: Transaction,
				as: 'transactions',
				include: [
					{
						model: Particular,
						through: {
							attributes: ['units', 'unitPrice'],
						},
					},
				],
			},
		],
	})

	if (!client) {
		return res.status(404).json({ error: 'Client not found' })
	}

	const formattedTransactions = client.transactions.map((transaction) => {
		const { joNumber, date, remarks, particulars } = transaction

		let totalAmount = 0
		let totalPayments = 0

		const formattedParticulars = particulars.map((particular) => {
			const { units, unitPrice } = particular.transactionParticular
			const isPayment = particular.type === 'Payment'

			if (!isPayment) {
				totalAmount += units * unitPrice
			} else {
				totalPayments += parseFloat(unitPrice)
			}

			if (isPayment) {
				return particular.name
			} else {
				return `${units} units ${particular.name}`
			}
		})

		const unitPrices = particulars.map(
			(particular) => particular.transactionParticular.unitPrice,
		)

		const balance = Math.max(totalAmount - totalPayments, 0)

		return {
			joNumber,
			date,
			particulars: formattedParticulars,
			unitPrices,
			amount: totalAmount,
			payment: totalPayments,
			balance,
			remarks: remarks || 'No remarks',
		}
	})

	res.status(200).json({
		client: {
			fullName: client.fullName,
			address: client.address,
		},
		transactions: formattedTransactions,
	})
})

router.post('/', async (req, res) => {
	const { title, firstName, lastName, address } = req.body
	const newClient = await Client.create({
		title,
		firstName,
		lastName,
		address,
	})
	res.json({
		...newClient.toJSON(),
		slugName: generateClientSlug(
			newClient.firstName,
			newClient.lastName,
			newClient.id,
		),
	})
})

router.put('/:id', async (req, res) => {
	const { id } = req.params
	const { title, firstName, lastName, address } = req.body

	const client = await Client.findByPk(id)
	if (!client) {
		return res.status(404).json({ error: 'Client not found' })
	}

	await client.update({ title, firstName, lastName, address })
	res.status(200).json({
		client: {
			...client.toJSON(),
			slugName: generateClientSlug(
				client.firstName,
				client.lastName,
				client.id,
			),
		},
	})
})

router.post('/check-name', async (req, res) => {
	const { firstName, lastName } = req.body

	const clientExists = await Client.findOne({
		where: {
			[Op.and]: [
				{ firstName: { [Op.iLike]: firstName } },
				{ lastName: { [Op.iLike]: lastName } },
			],
		},
	})

	res.json({ exists: !!clientExists })
})

router.delete('/:id', async (req, res) => {
	await Client.destroy({ where: { id: req.params.id } })
	res.json({ message: 'Client deleted' })
})

module.exports = router
