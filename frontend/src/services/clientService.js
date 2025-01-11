import axios from 'axios'

const baseUrl = 'http://localhost:3001/api/clients'

const getAll = async () => {
	const response = await axios.get(baseUrl)
	return response.data
}

const getOne = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`)
	return response.data
}

const create = async (newClient) => {
	const response = await axios.post(baseUrl, newClient)
	return response.data
}

const checkName = async ({ name }) => {
	const response = await axios.post(`${baseUrl}/check-name`, { name })
	return response.data
}

export default {
	getAll,
	getOne,
	create,
	checkName,
}
