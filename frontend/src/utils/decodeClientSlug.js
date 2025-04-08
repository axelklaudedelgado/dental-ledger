const decodeClientSlug = (slug, getName = false) => {
	const parts = slug.split('-')
	const encodedId = parts.pop()
	const capitalizedParts = parts.map(
		(part) => part.charAt(0).toUpperCase() + part.slice(1),
	)
	const id = parseInt(encodedId, 36)

	if (isNaN(id)) {
		throw new Error('Invalid slug format')
	}

	if (getName) {
		return capitalizedParts.join(' ')
	}

	return id
}

export default decodeClientSlug
