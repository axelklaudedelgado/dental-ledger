import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchClientDetails } from '../reducers/clientSlice'  
import { TransactionTable } from './TransactionTable'

export const ClientTransactions = () => {
    const { id } = useParams()  
    const dispatch = useDispatch()

    const { selectedClient, clientDetailsStatus, clientDetailsError } = useSelector((state) => state.clients)

    useEffect(() => {
        dispatch(fetchClientDetails(id))
    }, [id, dispatch])

    return (
        <div>
        <h1 className="text-4xl font-bold">Statement of Account</h1>
        {selectedClient ? (
            <>
                <p>Name: {selectedClient.name}</p>
                <p>Address: {selectedClient.address}</p>
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