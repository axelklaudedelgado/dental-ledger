import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchClients } from './reducers/clientSlice'

import { ClientTable } from './components/ClientTable'

function App() {
	const dispatch = useDispatch()
	const {
		items: clients,
		status,
		error,
	} = useSelector((state) => state.clients)

	useEffect(() => {
		dispatch(fetchClients())
	}, [dispatch])

	return (
		<div className="container mx-auto py-10">
			<ClientTable data={clients} status={status} error={error} />
		</div>
	)
}

export default App
