const generateClientSlug = (firstName, lastName, id) => {
	const name = `${firstName} ${lastName}`
		.toLowerCase()
		.replace(/\./g, '')
		.replace(/\s+/g, '-')

	const encodedId = id.toString(36)

	return `${name}-${encodedId}`
}

module.exports = generateClientSlug
