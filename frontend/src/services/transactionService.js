import axios from 'axios'

const baseUrl = 'http://localhost:3001/api/transactions'

const createTransaction = async (newTransaction) => {
	const response = await axios.post(baseUrl, newTransaction)
	return response.data
}

const nextJONumber = async () => {
	const response = await axios.get(`${baseUrl}/next-jo-number`)
	return response.data
}

export default { createTransaction, nextJONumber }
