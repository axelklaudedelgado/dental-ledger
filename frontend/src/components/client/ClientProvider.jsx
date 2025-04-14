import { useEffect } from 'react'
import { fetchClients } from '../../reducers/clientSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

const ClientDataProvider = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	const { lastUpdated } = useSelector((state) => state.clients)

	useEffect(() => {
		if (location.pathname === '/') {
			dispatch(fetchClients())
		}
	}, [dispatch, location.pathname, lastUpdated])

	return null
}

export default ClientDataProvider
