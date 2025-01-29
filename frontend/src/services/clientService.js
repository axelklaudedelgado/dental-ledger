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

const checkName = async ({ firstName, lastName }) => {
	const response = await axios.post(`${baseUrl}/check-name`, {
		firstName,
		lastName,
	})
	return response.data
}

const deleteOne = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`)
	return response.data
}

export default {
	getAll,
	getOne,
	create,
	checkName,
	deleteOne,
}
