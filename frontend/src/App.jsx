import { useSelector } from 'react-redux'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Wrapper from './components/Wrapper'
import { ClientTable } from '@/components/client/ClientTable'
import { ClientTransactions } from '@/components/client/ClientTransactions'

import TransactionSummary from './components/transaction/TransactionSummary'
import TransactionForm from '@/components/transaction/TransactionForm'
import TransactionReview from '@/components//transaction/TransactionReview'
import ClientDataProvider from '@/components/client/ClientProvider'

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
						path="/client/:slugName/transaction/:transactionId"
						element={<TransactionSummary />}
					/>
					<Route
						path="/client/:slugName/transaction/add"
						element={<TransactionForm />}
					/>
					<Route
						path="/client/:slugName/transaction/review"
						element={<TransactionReview />}
					/>
					<Route
						path="/client/:slugName/transaction/edit"
						element={<TransactionForm isUpdateMode={true} />}
					/>
					<Route
						path="/client/:slugName/transaction/edit/review"
						element={<TransactionReview isUpdateMode={true} />}
					/>
				</Route>
			</Routes>
		</Router>
	)
}

export default App
