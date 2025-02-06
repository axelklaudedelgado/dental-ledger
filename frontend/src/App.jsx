import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { fetchClients } from './reducers/clientSlice'

import Wrapper from './components/Wrapper'
import { ClientTable } from './components/ClientTable'
import { ClientTransactions } from './components/ClientTransactions'

function App() {
	const dispatch = useDispatch()
	const { clients, clientsStatus, clientsError } = useSelector(
		(state) => state.clients,
	)

	useEffect(() => {
		dispatch(fetchClients())
	}, [dispatch])

	return (
		<Router>
			<Routes>
				<Route element={<Wrapper />}>
					<Route
						path="/"
						element={
							<ClientTable
								data={clients}
								status={clientsStatus}
								error={clientsError}
							/>
						}
					/>
					<Route
						path="/client/:id/:slugName"
						element={<ClientTransactions />}
					/>
				</Route>
			</Routes>
		</Router>
	)
}

export default App
