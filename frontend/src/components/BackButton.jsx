import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const BackButton = ({
	navigateRoute = null,
	preserveState = true,
	clearSessionStorage = false,
	...props
}) => {
	const navigate = useNavigate()
	const location = useLocation()

	const handleBackClick = () => {
		if (clearSessionStorage) {
			sessionStorage.removeItem('pending_transaction_data')
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
