import { useSelector } from 'react-redux'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Wrapper from './components/Wrapper'
import { ClientTable } from './components/ClientTable'
import { ClientTransactions } from './components/ClientTransactions'

import TransactionForm from './components/TransactionForm'
import TransactionReview from './components/TransactionReview'
import ClientDataProvider from './components/ClientProvider'

function App() {
	const { clients, clientsStatus, clientsError, lastUpdated } = useSelector(
		(state) => state.clients,
	)

	return (
		<Router>
			<ClientDataProvider />
			<Routes>
				<Route element={<Wrapper />}>
					<Route
						path="/"
						element={
							<ClientTable
								key={lastUpdated}
								data={clients}
								status={clientsStatus}
								error={clientsError}
							/>
						}
					/>
					<Route
						path="/client/:slugName"
						element={<ClientTransactions />}
					/>
					<Route
						path="/client/:slugName/transaction/add"
						element={<TransactionForm />}
					/>
					<Route
						path="/client/:slugName/transaction/review"
						element={<TransactionReview />}
					/>
				</Route>
			</Routes>
		</Router>
	)
}

export default App
