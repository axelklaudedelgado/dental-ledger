import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ArrowUp } from 'lucide-react'

export const BackToTop = () => {
	const [showBackToTop, setShowBackToTop] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY || window.pageYOffset
			const scrollThreshold = 500

			setShowBackToTop(scrollPosition > scrollThreshold)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	}

	return (
		<>
			{showBackToTop && (
				<Button
					onClick={scrollToTop}
					variant="secondary"
					size="icon"
					className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-md z-50"
					aria-label="Back to top"
				>
					<ArrowUp className="h-5 w-5" />
				</Button>
			)}
		</>
	)
}
