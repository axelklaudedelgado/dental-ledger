function unknownEndpoint(request, response) {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response) => {
	console.log(error.message)

	if (error.name === 'SequelizeValidationError') {
		const messages = error.errors.map((error) => error.message)
		return response
			.status(400)
			.json({ error: 'Validation Error', errors: messages })
	}
	if (error.name === 'SequelizeDatabaseError') {
		return response
			.status(500)
			.json({ error: 'Database Error', message: error.message })
	}
	if (error.name === 'SequelizeForeignKeyConstraintError') {
		return response.status(400).json({
			error: 'Foreign Key Constraint Error',
			message: error.message,
		})
	}
	if (error.name === 'SequelizeUniqueConstraintError') {
		return response
			.status(409)
			.json({ error: 'Unique Constraint Error', message: error.message })
	}

	return response.status(500).json({
		error: 'InternalServerError',
		message: 'An unexpected error occurred.',
	})
}

module.exports = {
	unknownEndpoint,
	errorHandler,
}
