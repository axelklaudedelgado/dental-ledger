const router = require('express').Router()
const { Client } = require('../models')

router.get('/', async (req, res) => {
	const clients = await Client.findAll()
	res.json(clients)
})

router.post('/', async (req, res) => {
	const { name, address } = req.body
	const newClient = await Client.create({ name, address })
	res.json(newClient)
})

module.exports = router
