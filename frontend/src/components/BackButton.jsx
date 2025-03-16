import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { refreshClientList } from '@/reducers/clientSlice'

const BackButton = ({
	navigateRoute = null,
	preserveState = true,
	clearSessionStorage = false,
	refreshClients = false,
	...props
}) => {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()

	const handleBackClick = () => {
		if (clearSessionStorage) {
			sessionStorage.removeItem('pending_transaction_data')
		}

		if (refreshClients) {
			dispatch(refreshClientList())
		}

		if (navigateRoute) {
			if (
				typeof navigateRoute === 'string' &&
				navigateRoute.trim() !== ''
			) {
				navigate(navigateRoute, {
					state: preserveState ? location.state : undefined,
				})
			} else {
				navigate(-1)
			}
		} else {
			navigate(-1)
		}
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleBackClick}
			className="flex items-center"
			{...props}
		>
			<ArrowLeft className="mr-2 h-4 w-4" />
			Back
		</Button>
	)
}

export default BackButton
