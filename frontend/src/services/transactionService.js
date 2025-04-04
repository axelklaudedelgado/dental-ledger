import axios from 'axios'

const baseUrl = 'http://localhost:3001/api/transactions'

const createTransaction = async (newTransaction) => {
	const response = await axios.post(baseUrl, newTransaction)
	return response.data
}

const updateTransaction = async (id, updatedData) => {
	const response = await axios.put(`${baseUrl}/${id}`, updatedData)
	return response.data
}

const nextJONumber = async () => {
	const response = await axios.get(`${baseUrl}/next-jo-number`)
	return response.data
}

const deleteOne = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`)
	return response.data
}

export default { createTransaction, updateTransaction, nextJONumber, deleteOne }
