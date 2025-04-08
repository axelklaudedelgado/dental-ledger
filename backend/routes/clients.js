const router = require('express').Router()
const { Op } = require('sequelize')
const { Client, Transaction, Particular } = require('../models')
const generateClientSlug = require('../utils/generateClientSlug')
const formatTransaction = require('../utils/formatTransaction')

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
		attributes: [
			'id',
			'title',
			'firstName',
			'lastName',
			'address',
			'totalBalance',
			'lastTransactionDate',
			'status',
		],
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

	const formattedTransactions = client.transactions.map(formatTransaction)

	res.status(200).json({
		client: {
			fullName: client.fullName,
			address: client.address,
			totalBalance: Number(client.totalBalance),
			lastTransactionDate: client.lastTransactionDate,
			status: client.status,
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
