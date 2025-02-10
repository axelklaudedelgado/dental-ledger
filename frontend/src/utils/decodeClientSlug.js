const decodeClientSlug = (slug) => {
	const parts = slug.split('-')
	const encodedId = parts.pop()
	const id = parseInt(encodedId, 36)

	if (isNaN(id)) {
		throw new Error('Invalid slug format')
	}

	return id
}

export default decodeClientSlug
