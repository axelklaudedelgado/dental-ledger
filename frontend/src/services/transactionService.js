import axios from 'axios'

const baseUrl = 'http://localhost:3001/api/transactions'

const nextJONumber = async () => {
	const response = await axios.get(`${baseUrl}/next-jo-number`)
	return response.data
}

export default { nextJONumber }
