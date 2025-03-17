import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchClientDetails } from '../reducers/clientSlice'
import { TransactionTable } from './TransactionTable'
import BackButton from './BackButton'
import decodeClientSlug from '../utils/decodeClientSlug'

export const ClientTransactions = () => {
	const { slugName } = useParams()
	const id = decodeClientSlug(slugName)
	const dispatch = useDispatch()

	const { selectedClient, clientDetailsStatus, clientDetailsError } =
		useSelector((state) => state.clients)

	useEffect(() => {
		dispatch(fetchClientDetails(id))
	}, [id, dispatch])

	return (
		<div>
			<BackButton navigateRoute={'/'} refreshClients={true} />
			<h1 className="text-4xl font-bold">Statement of Account</h1>
			{selectedClient ? (
				<>
					<p>Name: {selectedClient.fullName}</p>
					<p>Address: {selectedClient.address}</p>
					<p>
						Grand Total: ₱
						{Number(selectedClient.totalBalance).toLocaleString(
							'en-PH',
							{ minimumFractionDigits: 2 },
						)}
					</p>
				</>
			) : (
				clientDetailsError && <div>No client details available.</div>
			)}
			<TransactionTable
				data={selectedClient ? selectedClient.transactions : []}
				status={clientDetailsStatus}
				error={clientDetailsError}
			/>
		</div>
	)
}
