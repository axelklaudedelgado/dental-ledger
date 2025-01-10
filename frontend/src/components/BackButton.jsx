import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
	const navigate = useNavigate()

	const handleBackClick = () => {
		navigate(-1)
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleBackClick}
			className="flex items-center"
		>
			<ArrowLeft className="mr-2 h-4 w-4" />
			Back
		</Button>
	)
}

export default BackButton
